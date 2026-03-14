import mongoose from 'mongoose';

const workerProfileSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
        skills: [{ type: String, trim: true }],
        yearsOfExperience: { type: Number, default: 0 },
        trade: { type: String, trim: true },
        bio: { type: String, maxlength: 1000 },
        portfolio: [{ title: String, description: String, images: [String] }],
        certifications: [{ name: String, issuedBy: String, year: Number, document: String }],
        isAvailable: { type: Boolean, default: true },
        hourlyRate: { type: Number },
        dailyRate: { type: Number },
        averageRating: { type: Number, default: 0, min: 0, max: 5 },
        totalReviews: { type: Number, default: 0 },
        completedJobs: { type: Number, default: 0 },
        location: {
            type: { type: String, enum: ['Point'], default: 'Point' },
            coordinates: { type: [Number], default: [0, 0] },
            address: String,
            city: String,
            radius: { type: Number, default: 50 }, // km willing to travel
        },
    },
    { timestamps: true }
);

workerProfileSchema.index({ location: '2dsphere' });
workerProfileSchema.index({ skills: 1 });

const WorkerProfile = mongoose.model('WorkerProfile', workerProfileSchema);
export default WorkerProfile;
