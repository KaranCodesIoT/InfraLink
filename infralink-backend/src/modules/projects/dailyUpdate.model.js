import mongoose from 'mongoose';

/* ── Media sub-doc ─────────────────────────────────────────────── */
const mediaSchema = new mongoose.Schema({
    url:     { type: String, required: true },
    type:    { type: String, enum: ['image', 'video'], default: 'image' },
    caption: { type: String, trim: true },
}, { _id: false });

/* ── Daily Update Schema ───────────────────────────────────────── */
const dailyUpdateSchema = new mongoose.Schema(
    {
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            required: true,
        },

        worker: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },

        /* Normalised to midnight — ensures max 1 update per worker per day */
        date: { type: Date, required: true },

        textNote: {
            type: String,
            required: [true, 'Please describe the work done today'],
            trim: true,
            maxlength: 2000,
        },

        media: [mediaSchema],

        hoursWorked: {
            type: Number,
            min: 0,
            max: 24,
        },

        submittedAt: { type: Date, default: Date.now },

        /* Auto-set by service: true if submitted after the daily cutoff */
        isLate: { type: Boolean, default: false },
    },
    { timestamps: true }
);

/* ── Compound unique index: one update per worker per project per day ── */
dailyUpdateSchema.index({ project: 1, worker: 1, date: 1 }, { unique: true });

/* ── Query helpers ────────────────────────────────────────────── */
dailyUpdateSchema.index({ project: 1, date: -1 });
dailyUpdateSchema.index({ worker: 1, date: -1 });

const DailyUpdate = mongoose.model('DailyUpdate', dailyUpdateSchema);
export default DailyUpdate;
