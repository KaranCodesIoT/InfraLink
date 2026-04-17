import mongoose from 'mongoose';

const builderProfileSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
        
        // STEP 1: Basic Profile
        companyName: { type: String, trim: true }, // Optional if Individual
        profileType: { 
            type: String, 
            enum: ['Individual Contractor', 'Builder Company', 'Freelancer', 'Builder'], 
            required: true 
        },
        officeAddress: { type: String, trim: true },
        serviceAreas: [{ type: String, trim: true }],
        yearsOfExperience: { type: Number, default: 0 },

        // STEP 2: KYC & Legal (Sensitive Data)
        kycDetails: {
            aadhaarNumber: { type: String, select: false }, // Hashed/masked usually, secure storage
            panNumber: { type: String, uppercase: true, trim: true },
            gstin: { type: String, uppercase: true, trim: true },
            reraRegistrationNumber: { type: String, trim: true },
            documents: {
                aadhaarCard: { type: String }, // Cloud URL
                panCard: { type: String },
                gstCertificate: { type: String },
                reraCertificate: { type: String }
            }
        },

        // STEP 3: Professional Details
        professionalDetails: {
            servicesOffered: [{ type: String, trim: true }],
            pricingModel: { 
                type: String, 
                enum: ['per sq ft', 'hourly', 'fixed'], 
                default: 'fixed' 
            },
            teamSize: { type: Number, default: 1 },
            pastProjects: [
                {
                    title: { type: String, required: true },
                    projectType: { type: String, enum: ['Residential', 'Commercial', 'Interior', 'Infrastructure', 'Renovation', 'Other'], default: 'Other' },
                    location: { type: String },
                    completionYear: { type: Number },
                    role: { type: String, enum: ['Builder', 'Contractor', 'Architect', 'Supervisor', 'Other'], default: 'Builder' },
                    description: { type: String, required: true },
                    media: [{
                        url: { type: String, required: true },
                        caption: { type: String, required: true },
                        category: { type: String, enum: ['site_work', 'final_output', 'before_after', 'blueprint_document'], default: 'final_output' },
                        type: { type: String, enum: ['image', 'video', 'document'], default: 'image' },
                    }],
                    legalDeclaration: {
                        contentOwnership: { type: Boolean, default: false },
                        genuineProject: { type: Boolean, default: false },
                        noCopyrightViolation: { type: Boolean, default: false },
                        acceptsConsequences: { type: Boolean, default: false },
                        declaredAt: { type: Date },
                    },
                    verificationStatus: { type: String, enum: ['self_declared', 'verified'], default: 'self_declared' },
                    createdAt: { type: Date, default: Date.now },
                }
            ]
        },

        // System states
        onboardingStepCompleted: { type: Number, default: 0, min: 0, max: 3 },
        isProfileActive: { type: Boolean, default: false },

        // Follow & Social features
        followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        followersCount: { type: Number, default: 0 },
        ratings: [
            {
                user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
                value: { type: Number, required: true, min: 1, max: 5 },
                review: { type: String, trim: true },
                createdAt: { type: Date, default: Date.now }
            }
        ],
        averageRating: { type: Number, default: 0 },
        totalReviews: { type: Number, default: 0 }
    },
    { timestamps: true }
);

builderProfileSchema.index({ profileType: 1 });
builderProfileSchema.index({ 'professionalDetails.servicesOffered': 1 });

const BuilderProfile = mongoose.model('BuilderProfile', builderProfileSchema);
export default BuilderProfile;
