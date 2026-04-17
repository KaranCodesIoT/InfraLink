import AIFeedback from './aiFeedback.model.js';
import AILearning  from './aiLearning.model.js';
import logger      from '../../../utils/logger.js';

// ─────────────────────────────────────────────────────────────────────────────
//  In-process concurrency guard for background analysis.
//  Replace with a Redis distributed lock in multi-instance deployments.
// ─────────────────────────────────────────────────────────────────────────────
let _analysisRunning = false;

// ─────────────────────────────────────────────────────────────────────────────
//  1. LOG INTERACTION
//  Delegates to AIFeedback.logInteraction() so all sanitisation, field-capping,
//  and enum validation live in one place (the model layer).
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
//  2. SAVE FEEDBACK  ←  called by the 👍 / 👎 buttons
//
//  feedback must be 'positive' | 'negative'
//  correctedRole is only required when feedback === 'negative' and the user
//  tells us which role should have been returned instead.
//
//  On negative feedback → triggers background pattern analysis so the system
//  learns from the mistake automatically.
// ─────────────────────────────────────────────────────────────────────────────
export const saveFeedback = async (interactionId, userId, feedback, note = null, correctedRole = null) => {
    try {
        const entry = await AIFeedback.attachFeedback(interactionId, userId, feedback, note, correctedRole);
        if (!entry) return null;

        if (feedback === 'negative') {
            // Fire-and-forget: don't block the API response
            triggerBackgroundAnalysis();
        }

        return entry;
    } catch (error) {
        logger.error(`[LearningEngine] Failed to save feedback: ${error.message}`);
        throw error;
    }
};

// ─────────────────────────────────────────────────────────────────────────────
//  3. GET RECENT MISTAKES  →  injected into the LLM system prompt
//
//  Returns an array of human-readable mistake strings for the requesting user
//  so the assistant actively avoids repeating the same errors.
// ─────────────────────────────────────────────────────────────────────────────
export const getRecentMistakes = async (userId, limit = 5) => {
    try {
        const mistakes = await AIFeedback.getRecentMistakes(userId, limit);
        if (!mistakes.length) return [];

        return mistakes.map(m =>
            `User asked "${m.query}" → mapped to ${m.mappedRole} ❌ (should have been ${m.correctedRole} ✅)`
        );
    } catch (error) {
        logger.error(`[LearningEngine] Failed to get mistakes: ${error.message}`);
        return [];
    }
};

// ─────────────────────────────────────────────────────────────────────────────
//  4. GET LEARNED CORRECTIONS  →  dynamic SKILL_MAP overrides
//
//  Returns { keyword: correctRole } for all active learned corrections.
//  These are passed into mapProblemToRole() and detectIntentRules() so
//  corrections from user feedback immediately affect future queries.
// ─────────────────────────────────────────────────────────────────────────────
export const getLearnedCorrections = async (userId) => {
    try {
        // getActiveOverrides() returns platform-wide corrections.
        // userId is accepted for future per-user personalisation.
        return await AILearning.getActiveOverrides();
    } catch (error) {
        logger.error(`[LearningEngine] Failed to get learned corrections: ${error.message}`);
        return {};
    }
};

// ─────────────────────────────────────────────────────────────────────────────
//  5. GET FEEDBACK STATS FOR A USER  (optional — useful for admin dashboards)
// ─────────────────────────────────────────────────────────────────────────────
export const getFeedbackStats = async (userId) => {
    try {
        const [positive, negative, total] = await Promise.all([
            AIFeedback.countDocuments({ user: userId, feedback: 'positive' }),
            AIFeedback.countDocuments({ user: userId, feedback: 'negative' }),
            AIFeedback.countDocuments({ user: userId, hasFeedback: true })
        ]);
        return { positive, negative, total, accuracy: total > 0 ? ((positive / total) * 100).toFixed(1) + '%' : 'N/A' };
    } catch (error) {
        logger.error(`[LearningEngine] Failed to get feedback stats: ${error.message}`);
        return { positive: 0, negative: 0, total: 0, accuracy: 'N/A' };
    }
};

// ─────────────────────────────────────────────────────────────────────────────
//  6. BACKGROUND ANALYSIS  →  promotes feedback patterns to AILearning
//
//  Triggered automatically after every negative feedback submission.
//  Aggregates correction patterns (e.g. "user always corrects 'tap issue' to
//  plumber") and promotes them to the AILearning collection so future queries
//  benefit immediately via getLearnedCorrections().
// ─────────────────────────────────────────────────────────────────────────────
const triggerBackgroundAnalysis = () => {
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
        const patterns = await AIFeedback.aggregateCorrectionPatterns(3);

        if (!patterns.length) {
            logger.info('[LearningEngine] No new correction patterns found');
            return;
        }

        let promoted = 0;
        for (const p of patterns) {
            try {
                await AILearning.recordCorrection(p.keyword, p.correctRole, null, 'auto');
                await AILearning.markTriggered(p.keyword);
                logger.info(`[LearningEngine] Promoted: "${p.keyword}" → ${p.correctRole} (${p.count} occurrences)`);
                promoted++;
            } catch (err) {
                logger.warn(`[LearningEngine] Failed to promote "${p.keyword}": ${err.message}`);
            }
        }

        logger.info(`[LearningEngine] Analysis complete — ${promoted}/${patterns.length} patterns promoted`);
    } catch (error) {
        logger.error(`[LearningEngine] Analysis failed: ${error.message}`);
    } finally {
        _analysisRunning = false;
    }
};

// ─────────────────────────────────────────────────────────────────────────────
//  7. PRUNE STALE CORRECTIONS  (call from a cron job, e.g. weekly)
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
