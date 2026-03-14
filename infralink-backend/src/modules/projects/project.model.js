import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String },
        client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        workers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
        status: {
            type: String,
            enum: ['planning', 'active', 'on_hold', 'completed', 'cancelled'],
            default: 'planning',
        },
        startDate: Date,
        endDate: Date,
        budget: Number,
        spent: { type: Number, default: 0 },
        progress: { type: Number, default: 0, min: 0, max: 100 },
        milestones: [{ title: String, dueDate: Date, isCompleted: Boolean }],
        documents: [{ name: String, url: String }],
    },
    { timestamps: true }
);

const Project = mongoose.model('Project', projectSchema);
export default Project;
