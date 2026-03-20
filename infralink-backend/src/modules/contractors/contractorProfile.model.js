import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    value: { type: Number, required: true, min: 1, max: 5 },
    review: { type: String, trim: true },
    createdAt: { type: Date, default: Date.now }
});

const portfolioSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    location: { type: String, trim: true },
    images: [{ type: String }],
    completedAt: { type: Date }
});

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
        pricing: {
            type: { type: String, enum: ['hourly', 'daily', 'fixed'] },
            amount: { type: Number, min: 0 }
        },
        tools: [{ type: String, trim: true }],
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
