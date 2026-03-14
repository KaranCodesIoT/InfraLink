import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
    {
        job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
        worker: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        coverLetter: { type: String, maxlength: 2000 },
        proposedRate: { type: Number },
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

const Application = mongoose.model('Application', applicationSchema);
export default Application;
