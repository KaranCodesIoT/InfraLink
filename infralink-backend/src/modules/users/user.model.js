import mongoose from 'mongoose';
import { ROLES } from '../../constants/roles.js';

export const CONTRACTOR_TYPES = [
    'General Contractor (Full Project)',
    'Interior Contractor',
    'Civil Contractor',
    'Electrical Contractor',
    'Plumbing Contractor',
    'Carpentry Contractor',
    'Painting Contractor',
    'Flooring Contractor',
    'HVAC Contractor (AC/Ventilation)',
    'Fabrication / Welding Contractor',
    'Modular Kitchen Contractor',
    'False Ceiling Contractor',
    'Tiles & Marble Contractor',
    'Waterproofing Contractor',
    'Demolition Contractor',
    'RCC Contractor (Reinforced Concrete)',
    'Piling / Foundation Contractor',
    'Scaffolding Contractor',
    'Landscaping Contractor',
    'Road / Paving Contractor',
    'Excavation Contractor',
    'Fire Safety Contractor',
    'Security Systems Contractor (CCTV, Access Control)',
    'MEP Contractor (Mechanical, Electrical, Plumbing)',
    'Glass & Aluminum Contractor',
    'Curtain / Blinds Contractor',
    'Furniture Contractor (Custom Work)',
    'Home Automation Contractor',
    'Solar Installation Contractor',
    'Industrial Equipment Installation Contractor',
    'Lift / Elevator Contractor'
];


export const PROFESSION_TYPES = [
    'Architect',
    'Civil Engineer',
    'Structural Engineer',
    'Electrical Engineer',
    'Mechanical Engineer',
    'Interior Designer'
];

const userSchema = new mongoose.Schema(
    {
        name: { type: String, trim: true },
        email: { type: String, lowercase: true, trim: true, unique: true, sparse: true },
        password: { type: String, select: false },
        role: { type: String, enum: Object.values(ROLES), default: 'unassigned' },
        phone: { type: String, unique: true, sparse: true, trim: true },
        contractorType: {
            type: String,
            enum: CONTRACTOR_TYPES,
            trim: true,
            required: function () {
                return this.role === 'contractor';
            }
        },
        professionType: {
            type: String,
            enum: PROFESSION_TYPES,
            trim: true,
            required: function () {
                return this.role === 'architect';
            }
        },
        avatar: { type: String },
        isVerified: { type: Boolean, default: false },
        isActive: { type: Boolean, default: true },
        kycStatus: { type: String, enum: ['pending', 'submitted', 'approved', 'rejected'], default: 'pending' },
        kycDocuments: [{ type: String }],
        kycDetails: {
            aadhaarNumber: { type: String, trim: true },
            panNumber: { type: String, trim: true },
            gstin: { type: String, trim: true },
            reraRegistrationNumber: { type: String, trim: true }
        },
        professionalDetails: {
            pricing: {
                amount: { type: Number },
                type: { type: String, trim: true } // e.g., 'hourly', 'project'
            },
            skillLevel: { type: String, trim: true },
            tools: [{ type: String, trim: true }]
        },
        skills: [{ type: String, trim: true }],
        experience: { type: String, trim: true },
        bio: { type: String, trim: true },
        averageRating: { type: Number, default: 0 },
        refreshToken: { type: String, select: false },
        lastLogin: { type: Date },
        location: {
            type: { type: String, enum: ['Point'], default: 'Point' },
            coordinates: { type: [Number], default: [0, 0] },
            address: String,
            city: String,
            state: String,
        },
        followersCount: { type: Number, default: 0 },
        followingCount: { type: Number, default: 0 },
        isPrivate: { type: Boolean, default: false },
        resume: { type: String },
    },
    { timestamps: true }
);

userSchema.index({ location: '2dsphere' });


const User = mongoose.model('User', userSchema);
export default User;
