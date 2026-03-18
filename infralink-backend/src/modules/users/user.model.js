import mongoose from 'mongoose';
import { ROLES } from '../../constants/roles.js';

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        password: { type: String, required: true, select: false },
        role: { type: String, enum: Object.values(ROLES), default: 'unassigned' },
        phone: { type: String, trim: true },
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
    },
    { timestamps: true }
);

userSchema.index({ location: '2dsphere' });
userSchema.index({ email: 1 });

const User = mongoose.model('User', userSchema);
export default User;
