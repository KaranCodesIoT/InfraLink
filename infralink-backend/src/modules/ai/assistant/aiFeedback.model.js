import mongoose from 'mongoose';

// ─────────────────────────────────────────────────────────────────────────────
//  CONSTANTS  (exported so controller + service stay in sync)
// ─────────────────────────────────────────────────────────────────────────────

// FIX: single source of truth for feedback values.
//      Old schema used 'good'/'bad'; controller sends 'positive'/'negative'.
//      Aligning here — update controller enum check to match.
export const FEEDBACK_VALUES = ['positive', 'negative'];

// FIX: keep in sync with INTENTS constant in assistant.service.js
export const VALID_INTENTS = [
    'search_professional', 'search_jobs', 'profile_help', 'hiring_help',
    'payment_help', 'post_job', 'platform_info', 'platform_stats',
    'greeting', 'new_user', 'general',
];

// FIX: keep in sync with responseType values emitted by askAssistant()
export const VALID_RESPONSE_TYPES = ['rag', 'jobs', 'chat', 'llm', 'stats'];

// FIX: import from the learning model so role list is never duplicated
export const VALID_ROLES = [
    'plumber', 'electrician', 'carpenter', 'painter',
    'welder', 'builder', 'labour', 'ac_technician',
    'contractor', 'architect', 'worker',
];

// Interactions without feedback expire after 30 days (keeps collection lean).
// Interactions WITH feedback are retained indefinitely (gold training data).
const NO_FEEDBACK_TTL_DAYS = 30;

// Field length caps
const MAX_QUERY_LENGTH = 1000;
const MAX_RESPONSE_LENGTH = 5000;
const MAX_FEEDBACK_NOTE_LEN = 500;

// ─────────────────────────────────────────────────────────────────────────────
//  SUB-SCHEMA: returned professional snapshot
// ─────────────────────────────────────────────────────────────────────────────
const returnedProfessionalSchema = new mongoose.Schema(
    {
        workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        name: { type: String, maxlength: 100 },
        // FIX: enum so bad role strings don't slip into the analytics dataset
        role: { type: String, enum: VALID_ROLES },
        // FIX: bound matchScore — values outside 0-1 are meaningless and would
        //      skew any downstream scoring analysis
        matchScore: { type: Number, min: 0, max: 1 },
    },
    { _id: false } // FIX: sub-docs in arrays don't need their own _id
);

// ─────────────────────────────────────────────────────────────────────────────
//  MAIN SCHEMA
// ─────────────────────────────────────────────────────────────────────────────
const aiFeedbackSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'user is required'],
        },

        // What the user asked
        query: {
            type: String,
            required: [true, 'query is required'],
            maxlength: [MAX_QUERY_LENGTH, `query must be ≤ ${MAX_QUERY_LENGTH} characters`],
            trim: true,
        },

        // What the system detected
        // FIX: enum — unrecognised intents now fail loudly instead of polluting analytics
        detectedIntent: {
            type: String,
            enum: {
                values: [...VALID_INTENTS, null],
                message: '"{VALUE}" is not a recognised intent',
            },
            default: null,
        },

        // FIX: enum — role must be platform-valid or null
        mappedRole: {
            type: String,
            enum: {
                values: [...VALID_ROLES, null],
                message: '"{VALUE}" is not a recognised professional role',
            },
            default: null,
        },

        // FIX: added 'llm' and 'stats' — both emitted by the fixed askAssistant()
        responseType: {
            type: String,
            enum: {
                values: VALID_RESPONSE_TYPES,
                message: '"{VALUE}" is not a recognised response type',
            },
            default: 'chat',
        },

        // AI response text snapshot
        responseText: {
            type: String,
            maxlength: [MAX_RESPONSE_LENGTH, `responseText must be ≤ ${MAX_RESPONSE_LENGTH} characters`],
        },

        professionalsReturned: {
            type: [returnedProfessionalSchema],
            default: [],
        },

        // User feedback
        // FIX: changed enum from 'good'/'bad' → 'positive'/'negative' to match
        //      what the controller validates and sends. Old values would have
        //      silently failed Mongoose validation on every feedback submission.
        feedback: {
            type: String,
            enum: {
                values: [...FEEDBACK_VALUES, null],
                message: `feedback must be one of: ${FEEDBACK_VALUES.join(', ')}`,
            },
            default: null,
        },

        feedbackNote: {
            type: String,
            maxlength: [MAX_FEEDBACK_NOTE_LEN, `feedbackNote must be ≤ ${MAX_FEEDBACK_NOTE_LEN} characters`],
            default: null,
            trim: true,
        },

        // FIX: enum — correctedRole must be a valid platform role
        correctedRole: {
            type: String,
            enum: {
                values: [...VALID_ROLES, null],
                message: '"{VALUE}" is not a recognised professional role',
            },
            default: null,
        },

        // FIX: explicit flag so the TTL index can target only no-feedback records.
        //      Set to true when feedback is submitted; TTL index ignores these.
        hasFeedback: {
            type: Boolean,
            default: false,
            index: true,
        },

        // FIX: track when feedback was actually submitted (separate from createdAt)
        feedbackAt: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

// ─────────────────────────────────────────────────────────────────────────────
//  INDEXES
// ─────────────────────────────────────────────────────────────────────────────

// Analytics: filter by feedback value, sorted by recency
aiFeedbackSchema.index({ feedback: 1, createdAt: -1 });

// RL training: find all bad mappings for a given role
aiFeedbackSchema.index({ mappedRole: 1, feedback: 1 });

// Per-user history (dashboard / context loading)
aiFeedbackSchema.index({ user: 1, createdAt: -1 });

// FIX: TTL — auto-delete interaction logs that never received feedback after
//      NO_FEEDBACK_TTL_DAYS days. Records with hasFeedback: true are excluded
//      by using a partial index so gold training data is never deleted.
aiFeedbackSchema.index(
    { createdAt: 1 },
    {
        expireAfterSeconds: NO_FEEDBACK_TTL_DAYS * 24 * 60 * 60,
        partialFilterExpression: { hasFeedback: false },
        name: 'ttl_no_feedback_interactions',
    }
);

// FIX: sparse text index — only index docs that have a query value, and only
//      after the maxlength cap reduces the per-doc index size risk.
aiFeedbackSchema.index({ query: 'text' }, { sparse: true });

// ─────────────────────────────────────────────────────────────────────────────
//  HOOKS
// ─────────────────────────────────────────────────────────────────────────────

// FIX: auto-set hasFeedback + feedbackAt when feedback is attached,
//      so the TTL partial filter stays accurate without manual bookkeeping.
aiFeedbackSchema.pre('save', function (next) {
    if (this.isModified('feedback') && this.feedback !== null) {
        this.hasFeedback = true;
        this.feedbackAt = this.feedbackAt ?? new Date();
    }
    next();
});

// ─────────────────────────────────────────────────────────────────────────────
//  STATIC METHODS  (FIX: centralise logInteraction + saveFeedback here)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Log a new AI interaction (no feedback yet).
 * Returns the saved document's _id for later feedback linking.
 *
 * @param {{
 *   userId: ObjectId,
 *   query: string,
 *   detectedIntent: string,
 *   mappedRole: string|null,
 *   responseType: string,
 *   responseText: string,
 *   professionalsReturned: Array
 * }} data
 * @returns {Promise<string>} interactionId (_id as string)
 */
aiFeedbackSchema.statics.logInteraction = async function (data) {
    const doc = await this.create({
        user: data.userId,
        query: (data.query || '').slice(0, MAX_QUERY_LENGTH),
        detectedIntent: VALID_INTENTS.includes(data.detectedIntent) ? data.detectedIntent : null,
        mappedRole: VALID_ROLES.includes(data.mappedRole) ? data.mappedRole : null,
        responseType: VALID_RESPONSE_TYPES.includes(data.responseType) ? data.responseType : 'chat',
        responseText: (data.responseText || '').slice(0, MAX_RESPONSE_LENGTH),
        professionalsReturned: (data.professionalsReturned || []).slice(0, 5).map(p => ({
            workerId: p.workerId,
            name: (p.name || '').slice(0, 100),
            role: VALID_ROLES.includes(p.role) ? p.role : undefined,
            matchScore: (typeof p.matchScore === 'number') ? Math.min(1, Math.max(0, p.matchScore)) : undefined,
        })),
    });
    return doc._id.toString();
};

/**
 * Attach user feedback to an existing interaction log.
 * Validates ownership (userId) before updating.
 *
 * @param {string} interactionId
 * @param {ObjectId|string} userId
 * @param {'positive'|'negative'} feedback
 * @param {string|null} note
 * @param {string|null} correctedRole
 * @returns {Promise<Document|null>} updated doc, or null if not found / not owned
 */
aiFeedbackSchema.statics.attachFeedback = async function (interactionId, userId, feedback, note = null, correctedRole = null) {
    if (!FEEDBACK_VALUES.includes(feedback)) {
        throw new Error(`feedback must be one of: ${FEEDBACK_VALUES.join(', ')}`);
    }
    if (correctedRole && !VALID_ROLES.includes(correctedRole)) {
        throw new Error(`correctedRole "${correctedRole}" is not a recognised professional role`);
    }

    const doc = await this.findOne({ _id: interactionId, user: userId });
    if (!doc) return null;   // not found or doesn't belong to this user

    doc.feedback = feedback;
    doc.feedbackNote = note ? note.slice(0, MAX_FEEDBACK_NOTE_LEN) : null;
    doc.correctedRole = correctedRole || null;
    // pre-save hook will set hasFeedback + feedbackAt

    return doc.save();
};

/**
 * Return recent negative interactions for a user (used by RL to surface mistakes).
 *
 * @param {ObjectId|string} userId
 * @param {number} limit
 * @returns {Promise<Array>}
 */
aiFeedbackSchema.statics.getRecentMistakes = async function (userId, limit = 10) {
    return this
        .find({ user: userId, feedback: 'negative' })
        .sort({ createdAt: -1 })
        .limit(limit)
        .select('query detectedIntent mappedRole correctedRole responseText createdAt')
        .lean();
};

/**
 * Aggregate correction patterns: keyword → correctRole pairs that appear
 * frequently enough to be promoted to the AILearning collection.
 *
 * @param {number} minOccurrences  - threshold before a pattern is returned
 * @returns {Promise<Array<{ keyword: string, correctRole: string, count: number }>>}
 */
aiFeedbackSchema.statics.aggregateCorrectionPatterns = async function (minOccurrences = 3) {
    return this.aggregate([
        { $match: { feedback: 'negative', correctedRole: { $ne: null }, query: { $ne: null } } },
        {
            $group: {
                _id: { query: '$query', correctRole: '$correctedRole' },
                count: { $sum: 1 },
            }
        },
        { $match: { count: { $gte: minOccurrences } } },
        {
            $project: {
                _id: 0,
                keyword: '$_id.query',
                correctRole: '$_id.correctRole',
                count: 1,
            }
        },
        { $sort: { count: -1 } },
    ]);
};

// ─────────────────────────────────────────────────────────────────────────────
//  MODEL
// ─────────────────────────────────────────────────────────────────────────────
const AIFeedback = mongoose.model('AIFeedback', aiFeedbackSchema);
export default AIFeedback;