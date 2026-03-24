import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    value: { type: Number, required: true, min: 1, max: 5 },
    review: { type: String, trim: true },
    createdAt: { type: Date, default: Date.now }
});

const portfolioSchema = new mongoose.Schema({
    title: { type: String, required: true },
    projectType: { type: String, enum: ['Residential', 'Commercial', 'Interior', 'Infrastructure', 'Renovation', 'Other'], default: 'Other' },
    location: { type: String },
    completionYear: { type: Number },
    role: { type: String, enum: ['Builder', 'Contractor', 'Architect', 'Supervisor', 'Other'], default: 'Contractor' },
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

const contractorProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    // Basic Info
    fullName: { type: String, trim: true },
    profileImage: { type: String },
    phone: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    address: { type: String, trim: true },
    serviceAreas: [{ type: String, trim: true }],
    experience: { type: Number, min: 0 },
    completedProjects: { type: Number, default: 0 },
    ongoingProjects: { type: Number, default: 0 },

    // KYC
    kycDetails: {
        aadhaarLast4: { type: String },
        aadhaarHash: { type: String },
        panNumber: { type: String, uppercase: true },
        gstin: { type: String, uppercase: true },
        documents: {
            aadhaarCard: String,
            panCard: String,
            gstCertificate: String
        }
    },
    kycStatus: {
        type: String,
        enum: ['unverified', 'kyc_pending', 'verified', 'rejected'],
        default: 'unverified'
    },

    // Professional
    professionalDetails: {
        services: [{ type: String, trim: true }], // electrician, plumber, etc.
        skillLevel: {
            type: String,
            enum: ['beginner', 'intermediate', 'expert']
        },
        portfolio: [portfolioSchema]
    },

    // Social & Rating System
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    followersCount: { type: Number, default: 0 },
    ratings: [ratingSchema],
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },

    // System
    onboardingStepCompleted: { type: Number, default: 0 },
    isProfileActive: { type: Boolean, default: false }

}, { timestamps: true });

// Ensure calculating average triggers on subdocument changes
contractorProfileSchema.pre('save', function(next) {
    if (this.isModified('ratings') || this.isNew) {
        this.totalReviews = this.ratings.length;
        if (this.totalReviews > 0) {
            const sum = this.ratings.reduce((acc, curr) => acc + curr.value, 0);
            this.averageRating = Math.round((sum / this.totalReviews) * 10) / 10;
        } else {
            this.averageRating = 0;
        }
    }
    next();
});

const ContractorProfile = mongoose.model('ContractorProfile', contractorProfileSchema);
export default ContractorProfile;
