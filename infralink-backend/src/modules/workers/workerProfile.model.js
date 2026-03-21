import mongoose from 'mongoose';

const portfolioSchema = new mongoose.Schema({
    title: { type: String, required: true },
    projectType: { type: String, enum: ['Residential', 'Commercial', 'Interior', 'Infrastructure', 'Renovation', 'Other'], default: 'Other' },
    location: { type: String },
    completionYear: { type: Number },
    role: { type: String, enum: ['Builder', 'Contractor', 'Architect', 'Supervisor', 'Other'], default: 'Other' },
    description: { type: String, required: true },
    media: [{
        url: { type: String, required: true },
        caption: { type: String, required: true },
        category: { type: String, enum: ['site_work', 'final_output', 'before_after', 'blueprint_document'], default: 'final_output' },
        type: { type: String, enum: ['image', 'video', 'document'], default: 'image' },
    }],
    images: [{ type: String }], // Legacy support
    legalDeclaration: {
        contentOwnership: { type: Boolean, default: false },
        genuineProject: { type: Boolean, default: false },
        noCopyrightViolation: { type: Boolean, default: false },
        acceptsConsequences: { type: Boolean, default: false },
        declaredAt: { type: Date }
    },
    verificationStatus: { type: String, enum: ['self_declared', 'verified'], default: 'self_declared' },
}, { timestamps: true });

const workerProfileSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
        skills: [{ type: String, trim: true }],
        yearsOfExperience: { type: Number, default: 0 },
        trade: { type: String, trim: true },
        bio: { type: String, maxlength: 1000 },
        portfolio: [portfolioSchema],
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
