import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
    {
        job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
        worker: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        message: { type: String, maxlength: 3000 },
        coverLetter: { type: String, maxlength: 3000 }, // kept for backward compat
        proposedRate: { type: Number },
        contactDetails: {
            phone: { type: String, trim: true },
            email: { type: String, trim: true, lowercase: true },
        },
        status: {
            type: String,
            enum: ['pending', 'shortlisted', 'rejected', 'hired', 'withdrawn'],
            default: 'pending',
        },
        attachments: [String],
    },
    { timestamps: true }
);

applicationSchema.index({ job: 1, worker: 1 }, { unique: true });
applicationSchema.index({ worker: 1, createdAt: -1 });

const Application = mongoose.model('Application', applicationSchema);
export default Application;
