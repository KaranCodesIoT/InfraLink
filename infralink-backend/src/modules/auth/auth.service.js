import User from '../users/user.model.js';
import { hashPassword, comparePassword } from '../../utils/encryption.utils.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../utils/token.utils.js';

import { generateAndSendEmailOtp, verifyEmailOtp as verifyStoredOtp } from './otp.service.js';

export const sendOtp = async ({ email }) => {
    // Validate email
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
        const err = new Error('Please provide a valid email address');
        err.statusCode = 400;
        throw err;
    }

    // Check if user exists, create shell if not
    let user = await User.findOne({ email });
    let isNewUser = false;
    
    if (!user) {
        user = await User.create({ email, role: 'unassigned' });
        isNewUser = true;
    }

    // Generate OTP → Store in Redis → Send via Email
    const otp = await generateAndSendEmailOtp(email);

    return { 
        message: 'OTP sent to email', 
        isNewUser,
        otp
    };
};

export const verifyOtp = async ({ email, otp }) => {
    // Verify OTP against stored OTP
    const isValid = await verifyStoredOtp(email, otp);
    
    if (!isValid) {
        const err = new Error('Invalid or expired OTP');
        err.statusCode = 401;
        err.code = 'INVALID_OTP';
        throw err;
    }

    // Find the user (they were created in sendOtp if they didn't exist)
    const user = await User.findOne({ email }).select('+refreshToken');
    if (!user) {
        const err = new Error('User not found');
        err.statusCode = 404;
        throw err;
    }

    // Generate JWT tokens
    const accessToken = signAccessToken({ id: user._id, role: user.role });
    const refreshToken = signRefreshToken({ id: user._id });

    // Store refresh token
    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    return {
        user: { 
            _id: user._id, 
            name: user.name, 
            email: user.email, 
            role: user.role, 
            avatar: user.avatar 
        },
        accessToken,
        refreshToken,
    };
};

export const refreshTokens = async (token) => {
    const decoded = verifyRefreshToken(token);
    const user = await User.findById(decoded.id).select('+refreshToken');
    if (!user || user.refreshToken !== token) {
        const err = new Error('Invalid refresh token');
        err.statusCode = 401;
        err.code = 'TOKEN_INVALID';
        throw err;
    }

    const accessToken = signAccessToken({ id: user._id, role: user.role });
    const refreshToken = signRefreshToken({ id: user._id });

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
};

export const logout = async (userId) => {
    await User.findByIdAndUpdate(userId, { refreshToken: null });
};
