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
    'Demolition Contractor'
];

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        password: { type: String, required: true, select: false },
        role: { type: String, enum: Object.values(ROLES), default: 'unassigned' },
        phone: { type: String, trim: true },
        contractorType: {
            type: String,
            enum: CONTRACTOR_TYPES,
            trim: true,
            required: function () {
                return this.role === 'contractor';
            }
        },
        avatar: { type: String },
        isVerified: { type: Boolean, default: false },
        isActive: { type: Boolean, default: true },
        kycStatus: { type: String, enum: ['pending', 'submitted', 'approved', 'rejected'], default: 'pending' },
        kycDocuments: [{ type: String }],
        skills: [{ type: String, trim: true }],
        experience: { type: String, trim: true },
        bio: { type: String, trim: true },
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
    },
    { timestamps: true }
);

userSchema.index({ location: '2dsphere' });
userSchema.index({ email: 1 });

const User = mongoose.model('User', userSchema);
export default User;
