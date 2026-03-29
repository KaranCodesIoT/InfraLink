import mongoose from 'mongoose';

/* ── Score History Entry ───────────────────────────────────────── */
const scoreHistorySchema = new mongoose.Schema({
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    points:  { type: Number, required: true },
    reason:  { type: String, required: true, trim: true },
    date:    { type: Date, default: Date.now },
}, { _id: false });

/* ── Worker Score Schema ───────────────────────────────────────── */
const workerScoreSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
        },

        totalPoints:       { type: Number, default: 0 },
        consistencyScore:  { type: Number, default: 0, min: 0, max: 100 },   // percentage
        projectsCompleted: { type: Number, default: 0 },
        totalUpdates:      { type: Number, default: 0 },
        missedUpdates:     { type: Number, default: 0 },

        streakCurrent: { type: Number, default: 0 },
        streakBest:    { type: Number, default: 0 },

        /* Recent history (capped at last 200 entries) */
        history: {
            type: [scoreHistorySchema],
            default: [],
        },
    },
    { timestamps: true }
);

/* ── Index ─────────────────────────────────────────────────────── */
workerScoreSchema.index({ totalPoints: -1 }); // leaderboard

const WorkerScore = mongoose.model('WorkerScore', workerScoreSchema);
export default WorkerScore;
