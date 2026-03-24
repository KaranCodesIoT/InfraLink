import mongoose from 'mongoose';
import { JOB_STATUS } from '../../constants/jobStatus.js';

const jobSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String, required: true },
        category: {
            type: String,
            enum: ['builder', 'contractor', 'architect', 'labour', 'supplier', 'general'],
            default: 'general',
            required: true,
        },
        client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        status: { type: String, enum: Object.values(JOB_STATUS), default: 'open' },
        requiredSkills: [{ type: String, trim: true }],
        budget: {
            min: { type: Number, default: null },
            max: { type: Number, default: null },
            currency: { type: String, default: 'INR' },
        },
        location: {
            type: { type: String, enum: ['Point'], default: 'Point' },
            coordinates: { type: [Number], default: [0, 0] },
            address: String,
            city: String,
            state: String,
        },
        deadline: { type: Date },
        contactDetails: {
            name: { type: String, trim: true },
            phone: { type: String, trim: true },
            email: { type: String, trim: true, lowercase: true },
        },
        images: [String],
        assignedWorker: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        applicationsCount: { type: Number, default: 0 },
        isUrgent: { type: Boolean, default: false },
    },
    { timestamps: true }
);

jobSchema.index({ location: '2dsphere' });
jobSchema.index({ status: 1, category: 1 });
jobSchema.index({ 'budget.min': 1, 'budget.max': 1 });
jobSchema.index({ title: 'text', description: 'text' });

const Job = mongoose.model('Job', jobSchema);
export default Job;
