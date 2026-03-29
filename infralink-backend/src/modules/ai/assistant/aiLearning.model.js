import mongoose from 'mongoose';

// ─────────────────────────────────────────────────────────────────────────────
//  CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

// FIX: centralise valid roles so enum is always in sync with the service layer.
//      Any role not in this list is rejected at the DB level.
const VALID_ROLES = [
    'plumber', 'electrician', 'carpenter', 'painter',
    'welder', 'builder', 'labour', 'ac_technician',
    'contractor', 'architect', 'worker',
];

// A correction must be observed this many times before it is trusted enough
// to be auto-activated and applied to live traffic.
const MIN_OCCURRENCES_FOR_ACTIVATION = 3;

// Below this confidence the entry is auto-deactivated on save.
const MIN_CONFIDENCE_THRESHOLD = 0.4;

// ─────────────────────────────────────────────────────────────────────────────
//  SCHEMA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * AI Learning Model — stores learned skill corrections from user feedback.
 * Gets smarter over time: when "bathroom leak" → "builder" receives repeated
 * 👎 feedback, the system records "bathroom leak" → "plumber" here and starts
 * applying it automatically once MIN_OCCURRENCES_FOR_ACTIVATION is reached.
 */
const aiLearningSchema = new mongoose.Schema(
    {
        // The keyword/phrase that triggered the wrong mapping
        keyword: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            // FIX: cap length — an unbounded keyword string is a data quality
            //      risk and could bloat index entries.
            maxlength: [100, 'Keyword must be ≤ 100 characters'],
            minlength: [2, 'Keyword must be at least 2 characters'],
        },

        // What role the system incorrectly assigned (optional — not always known)
        // FIX: enum so invalid role strings can't pollute the correction store.
        wrongRole: {
            type: String,
            enum: {
                values: [...VALID_ROLES, null],   // null = unknown / not recorded
                message: '"{VALUE}" is not a recognised professional role',
            },
            default: null,
        },

        // What role it SHOULD be (learned from feedback)
        // FIX: enum — critical field, must only contain platform-valid roles.
        correctRole: {
            type: String,
            required: [true, 'correctRole is required'],
            enum: {
                values: VALID_ROLES,
                message: '"{VALUE}" is not a recognised professional role',
            },
        },

        // How confident the system is in this correction (0.0 – 1.0)
        confidence: {
            type: Number,
            default: 0.5,
            min: [0, 'Confidence cannot be negative'],
            max: [1, 'Confidence cannot exceed 1.0'],
        },

        // How many times this correction has been observed
        // FIX: min: 1 — zero or negative occurrences are nonsensical.
        occurrences: {
            type: Number,
            default: 1,
            min: [1, 'Occurrences must be at least 1'],
        },

        // Source of the correction
        source: {
            type: String,
            enum: ['feedback', 'admin', 'auto'],
            default: 'feedback',
        },

        // FIX: isActive is now managed by the pre-save hook based on confidence
        //      and occurrences thresholds — it's no longer a free-floating flag
        //      that can be set arbitrarily and silently serve bad corrections.
        isActive: {
            type: Boolean,
            default: false,   // starts inactive; hook promotes it when thresholds are met
        },

        // FIX: track when this correction was last applied to live traffic.
        //      Stale entries (never triggered, or not triggered in months) can
        //      be pruned without guessing.
        lastTriggered: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

// ─────────────────────────────────────────────────────────────────────────────
//  INDEXES
//  FIX: The old schema had two separate single-field indexes. Replaced with
//       purpose-built compound indexes that match real query patterns.
// ─────────────────────────────────────────────────────────────────────────────

// Uniqueness constraint — one correction record per (keyword, correctRole) pair.
aiLearningSchema.index({ keyword: 1, correctRole: 1 }, { unique: true });

// FIX: Compound index for the hot query path in getLearnedCorrections():
//      db.ailearnings.find({ isActive: true }).sort({ confidence: -1 })
//      The old index had isActive and confidence as separate indexes which
//      MongoDB would not combine efficiently for this query.
aiLearningSchema.index({ isActive: 1, confidence: -1, occurrences: -1 });

// FIX: Index for stale-entry cleanup queries (find never-triggered or old entries).
aiLearningSchema.index({ lastTriggered: 1, isActive: 1 });

// ─────────────────────────────────────────────────────────────────────────────
//  HOOKS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * FIX: Auto-manage isActive based on confidence + occurrences thresholds.
 *
 * Before every save:
 * - Promote to active  if occurrences >= MIN and confidence >= MIN threshold
 * - Demote to inactive if confidence drops below threshold (e.g. after a reversal)
 * - Admin-sourced entries bypass the occurrences requirement (trusted immediately)
 */
aiLearningSchema.pre('save', function (next) {
    const meetsOccurrences = this.source === 'admin' || this.occurrences >= MIN_OCCURRENCES_FOR_ACTIVATION;
    const meetsConfidence = this.confidence >= MIN_CONFIDENCE_THRESHOLD;

    this.isActive = meetsOccurrences && meetsConfidence;
    next();
});

// ─────────────────────────────────────────────────────────────────────────────
//  STATIC METHODS
//  FIX: Centralise the upsert/bump logic here so every caller (learning.service,
//       feedback handler, admin tools) uses the same algorithm and can't drift.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Record or reinforce a learned correction.
 * - If the (keyword, correctRole) pair already exists, increments occurrences
 *   and recalculates confidence using a weighted moving average.
 * - If it doesn't exist, creates a new entry with occurrence = 1.
 *
 * @param {string} keyword      - The phrase that was mis-mapped
 * @param {string} correctRole  - The role it should have mapped to
 * @param {string} wrongRole    - The role it was incorrectly mapped to (optional)
 * @param {string} source       - 'feedback' | 'admin' | 'auto'
 * @returns {Promise<Document>} The updated or created learning document
 */
aiLearningSchema.statics.recordCorrection = async function (keyword, correctRole, wrongRole = null, source = 'feedback') {
    const kw = keyword.toLowerCase().trim();

    const existing = await this.findOne({ keyword: kw, correctRole });

    if (existing) {
        existing.occurrences += 1;
        // Weighted moving average: new confidence pulls toward 1.0 with each confirmation
        existing.confidence = Math.min(1.0, existing.confidence + (1 - existing.confidence) * 0.2);
        if (wrongRole) existing.wrongRole = wrongRole;
        // pre-save hook will re-evaluate isActive
        return existing.save();
    }

    return this.create({ keyword: kw, correctRole, wrongRole, source, confidence: 0.5, occurrences: 1 });
};

/**
 * Penalise a correction (user said the "correction" was also wrong).
 * Reduces confidence; if it drops below threshold the hook deactivates it.
 *
 * @param {string} keyword
 * @param {string} correctRole
 * @returns {Promise<Document|null>}
 */
aiLearningSchema.statics.penaliseCorrection = async function (keyword, correctRole) {
    const entry = await this.findOne({ keyword: keyword.toLowerCase().trim(), correctRole });
    if (!entry) return null;

    entry.confidence = Math.max(0, entry.confidence - 0.2);
    // pre-save hook will deactivate if confidence < MIN_CONFIDENCE_THRESHOLD
    return entry.save();
};

/**
 * Return all active corrections as a plain keyword → role map,
 * ready to be passed into mapProblemToRole() as learnedOverrides.
 *
 * @returns {Promise<Record<string, string>>}
 */
aiLearningSchema.statics.getActiveOverrides = async function () {
    const entries = await this
        .find({ isActive: true })
        .sort({ confidence: -1, occurrences: -1 })
        .select('keyword correctRole -_id')
        .lean();

    return Object.fromEntries(entries.map(e => [e.keyword, e.correctRole]));
};

/**
 * Mark a correction as triggered (updates lastTriggered timestamp).
 * Call this whenever a learned override is actually applied in production.
 *
 * @param {string} keyword
 * @returns {Promise<void>}
 */
aiLearningSchema.statics.markTriggered = async function (keyword) {
    await this.updateOne(
        { keyword: keyword.toLowerCase().trim(), isActive: true },
        { $set: { lastTriggered: new Date() } }
    );
};

/**
 * Remove stale corrections that have never been triggered and are older than
 * `daysOld` days, or were last triggered more than `daysOld` days ago.
 * Safe to run on a cron job.
 *
 * @param {number} daysOld  - entries older than this are removed (default 90)
 * @returns {Promise<number>} count of deleted entries
 */
aiLearningSchema.statics.pruneStale = async function (daysOld = 90) {
    const cutoff = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
    const result = await this.deleteMany({
        isActive: false,
        $or: [
            { lastTriggered: null, createdAt: { $lt: cutoff } },
            { lastTriggered: { $lt: cutoff } },
        ],
    });
    return result.deletedCount;
};

// ─────────────────────────────────────────────────────────────────────────────
//  MODEL
// ─────────────────────────────────────────────────────────────────────────────
const AILearning = mongoose.model('AILearning', aiLearningSchema);
export default AILearning;
export { VALID_ROLES, MIN_OCCURRENCES_FOR_ACTIVATION, MIN_CONFIDENCE_THRESHOLD };