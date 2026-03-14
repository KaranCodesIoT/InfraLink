import mongoose from 'mongoose';
import { JOB_STATUS } from '../../constants/jobStatus.js';

const jobSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String, required: true },
        client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        status: { type: String, enum: Object.values(JOB_STATUS), default: 'open' },
        requiredSkills: [{ type: String, trim: true }],
        budget: { min: Number, max: Number, currency: { type: String, default: 'INR' } },
        duration: { value: Number, unit: { type: String, enum: ['days', 'weeks', 'months'] } },
        location: {
            type: { type: String, enum: ['Point'], default: 'Point' },
            coordinates: { type: [Number], default: [0, 0] },
            address: String,
            city: String,
            state: String,
        },
        images: [String],
        assignedWorker: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        startDate: Date,
        endDate: Date,
        applicationsCount: { type: Number, default: 0 },
        isUrgent: { type: Boolean, default: false },
    },
    { timestamps: true }
);

jobSchema.index({ location: '2dsphere' });
jobSchema.index({ status: 1, requiredSkills: 1 });

const Job = mongoose.model('Job', jobSchema);
export default Job;
