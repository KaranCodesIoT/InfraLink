import AIFeedback from './aiFeedback.model.js';
import AILearning from './aiLearning.model.js';
import { MIN_CONFIDENCE_THRESHOLD } from './aiLearning.model.js';
import logger from '../../../utils/logger.js';

// Guard against concurrent analyzeFailures runs (simple in-process lock).
// In a multi-instance deployment, replace with a Redis-based distributed lock.
let _analysisRunning = false;

// ─────────────────────────────────────────────────────────────────────────────
//  1. LOG INTERACTION
//  FIX: delegate to AIFeedback.logInteraction() so all sanitisation,
//       field-capping, and enum validation live in one place (the model).
//       The old code did AIFeedback.create(data) which bypassed all of that.
// ─────────────────────────────────────────────────────────────────────────────
export const logInteraction = async (data) => {
    try {
        return await AIFeedback.logInteraction(data);
    } catch (error) {
        logger.error(`[LearningEngine] Failed to log interaction: ${error.message}`);
        return null;
    }
};

// ─────────────────────────────────────────────────────────────────────────────
//  2. SAVE FEEDBACK
//  FIX 1: delegate to AIFeedback.attachFeedback() so the pre('save') hook
//          fires and sets hasFeedback + feedbackAt — critical for the TTL
//          partial filter to work (without this, feedback records would be
//          deleted after 30 days alongside no-feedback interactions).
//  FIX 2: trigger background analysis on 'negative' (was 'bad' — old enum).
// ─────────────────────────────────────────────────────────────────────────────
export const saveFeedback = async (interactionId, userId, feedback, note = null, correctedRole = null) => {
    try {
        const entry = await AIFeedback.attachFeedback(interactionId, userId, feedback, note, correctedRole);
        if (!entry) return null;

        // FIX: 'negative' not 'bad' — aligns with the corrected enum
        if (feedback === 'negative') {
            triggerBackgroundAnalysis();
        }

        return entry;
    } catch (error) {
        logger.error(`[LearningEngine] Failed to save feedback: ${error.message}`);
        throw error;
    }
};

// ─────────────────────────────────────────────────────────────────────────────
//  3. GET RECENT MISTAKES  (injected into LLM system prompt)
//  FIX: old function ignored the userId parameter entirely — returned global
//       mistakes, not the mistakes for the current user's session. The assistant
//       service was calling getRecentMistakes(userId) expecting per-user data.
// ─────────────────────────────────────────────────────────────────────────────
export const getRecentMistakes = async (userId, limit = 5) => {
    try {
        // FIX: delegate to the model static method which is userId-scoped
        const mistakes = await AIFeedback.getRecentMistakes(userId, limit);
        if (mistakes.length === 0) return [];

        return mistakes.map(m =>
            `User asked "${m.query}" → mapped to ${m.mappedRole} ❌ (should have been ${m.correctedRole} ✅)`
        );
    } catch (error) {
        logger.error(`[LearningEngine] Failed to get mistakes: ${error.message}`);
        return [];
    }
};

// ─────────────────────────────────────────────────────────────────────────────
//  4. GET LEARNED CORRECTIONS  (dynamic skill-map overrides)
//  FIX 1: old function ignored the userId parameter — signature mismatch with
//         the assistant service call getLearnedCorrections(userId).
//  FIX 2: reimplemented the AILearning query inline with a hardcoded 0.7
//         confidence threshold that differed from MIN_CONFIDENCE_THRESHOLD.
//         Now delegates to AILearning.getActiveOverrides() which is the single
//         source of truth for this logic.
// ─────────────────────────────────────────────────────────────────────────────
export const getLearnedCorrections = async (userId) => {
    try {
        // getActiveOverrides() returns { keyword: correctRole } for all entries
        // where isActive === true (managed by the pre('save') hook in the model).
        // userId is accepted for future per-user personalisation but the base
        // implementation uses platform-wide corrections.
        return await AILearning.getActiveOverrides();
    } catch (error) {
        logger.error(`[LearningEngine] Failed to get learned corrections: ${error.message}`);
        return {};
    }
};

// ─────────────────────────────────────────────────────────────────────────────
//  5. BACKGROUND ANALYSIS  (promote feedback patterns → AILearning)
//  FIX 1: added an in-process concurrency guard so overlapping triggers
//         (e.g. rapid 👎 taps) don't run the aggregation simultaneously.
//  FIX 2: delegate to AIFeedback.aggregateCorrectionPatterns() instead of
//         duplicating the aggregation pipeline here.
//  FIX 3: delegate to AILearning.recordCorrection() instead of raw
//         findOneAndUpdate — this ensures the pre('save') hook runs and
//         isActive is managed by thresholds, not set manually.
//  FIX 4: the old confidence formula (0.5 + count * 0.1) could silently
//         exceed 1.0 when count > 5 despite the Math.min(0.95) guard.
//         recordCorrection() uses a proper weighted moving average instead.
// ─────────────────────────────────────────────────────────────────────────────
const triggerBackgroundAnalysis = () => {
    // Fire-and-forget intentionally — we don't want to block the feedback
    // response. Errors are caught and logged inside analyzeFailures().
    analyzeFailures().catch(err =>
        logger.error(`[LearningEngine] Unhandled analysis error: ${err.message}`)
    );
};

const analyzeFailures = async () => {
    if (_analysisRunning) {
        logger.info('[LearningEngine] Analysis already running — skipping duplicate trigger');
        return;
    }

    _analysisRunning = true;
    try {
        // FIX: use the centralised aggregation from the model
        const patterns = await AIFeedback.aggregateCorrectionPatterns(3);

        if (patterns.length === 0) {
            logger.info('[LearningEngine] No new correction patterns found');
            return;
        }

        let promoted = 0;
        for (const p of patterns) {
            try {
                // FIX: recordCorrection() handles upsert + confidence moving average
                //      + isActive promotion via the pre('save') hook in AILearning.
                await AILearning.recordCorrection(
                    p.keyword,
                    p.correctRole,
                    null,      // wrongRole not available from aggregation
                    'auto'
                );

                // Mark the correction as triggered so stale-pruning knows it's live
                await AILearning.markTriggered(p.keyword);

                logger.info(`[LearningEngine] Promoted mapping: "${p.keyword}" → ${p.correctRole} (${p.count} occurrences)`);
                promoted++;
            } catch (err) {
                // Log per-pattern errors without aborting the whole batch
                logger.warn(`[LearningEngine] Failed to promote "${p.keyword}": ${err.message}`);
            }
        }

        logger.info(`[LearningEngine] Analysis complete — ${promoted}/${patterns.length} patterns promoted`);
    } catch (error) {
        logger.error(`[LearningEngine] Analysis failed: ${error.message}`);
    } finally {
        // Always release the lock, even on error
        _analysisRunning = false;
    }
};

// ─────────────────────────────────────────────────────────────────────────────
//  6. PRUNE STALE LEARNING ENTRIES  (call from a cron job)
//  New export — wraps AILearning.pruneStale() for external scheduling.
// ─────────────────────────────────────────────────────────────────────────────
export const pruneStaleCorrections = async (daysOld = 90) => {
    try {
        const deleted = await AILearning.pruneStale(daysOld);
        logger.info(`[LearningEngine] Pruned ${deleted} stale correction(s) older than ${daysOld} days`);
        return deleted;
    } catch (error) {
        logger.error(`[LearningEngine] Prune failed: ${error.message}`);
        return 0;
    }
};