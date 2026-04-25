import User from '../users/user.model.js';
import { hashPassword, comparePassword } from '../../utils/encryption.utils.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../utils/token.utils.js';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function verifyGoogleToken(token) {
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        return {
            email: payload.email,
            name: payload.name,
            picture: payload.picture,
            googleId: payload.sub,
        };
    } catch (error) {
        console.error('Google token verification failed:', error);
        throw new Error('Invalid Google token');
    }
}

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

export const checkOtp = async ({ email, otp }) => {
    // Verify OTP against stored OTP
    const isValid = await verifyStoredOtp(email, otp);
    
    if (!isValid) {
        const err = new Error('Invalid or expired OTP');
        err.statusCode = 401;
        err.code = 'INVALID_OTP';
        throw err;
    }

    // Mark email as verified temporarily
    const { markEmailAsVerified } = await import('./otp.service.js');
    await markEmailAsVerified(email);

    return { message: 'OTP verified successfully' };
};

export const verifyOtp = async ({ email, password }) => {
    // Check if email was verified via OTP
    const { isEmailVerified } = await import('./otp.service.js');
    const isVerified = await isEmailVerified(email);

    if (!isVerified) {
        const err = new Error('Please verify your email with OTP first');
        err.statusCode = 403;
        throw err;
    }

    // Find the user (they were created in sendOtp if they didn't exist)
    const user = await User.findOne({ email }).select('+password +refreshToken');
    if (!user) {
        const err = new Error('User not found');
        err.statusCode = 404;
        throw err;
    }

    // Check or set password
    if (user.password) {
        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) {
            const err = new Error('Incorrect password');
            err.statusCode = 401;
            throw err;
        }
    } else {
        // If they don't have a password yet (new user), save this as their password
        user.password = await hashPassword(password);
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

export const googleAuth = async ({ token }) => {
    const userData = await verifyGoogleToken(token);

    let user = await User.findOne({ email: userData.email }).select('+password +refreshToken');

    if (!user) {
        // Create new user if doesn't exist
        user = await User.create({
            name: userData.name,
            email: userData.email,
            googleId: userData.googleId,
            profilePic: userData.picture,
            role: 'unassigned', // Use 'unassigned' or null as per your ROLES constants
            isNewUser: true,
            provider: 'google',
        });
    } else if (!user.googleId) {
        // Link Google ID if email matches but registered locally
        user.googleId = userData.googleId;
        user.profilePic = userData.picture;
        user.provider = 'google';
        await user.save({ validateBeforeSave: false });
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
            avatar: user.avatar || user.profilePic,
            isNewUser: user.isNewUser
        },
        accessToken,
        refreshToken,
    };
};

export const updateRole = async (userId, data) => {
    const user = await User.findByIdAndUpdate(
        userId,
        { ...data, isNewUser: false },
        { new: true, runValidators: true }
    );

    if (!user) {
        const err = new Error('User not found');
        err.statusCode = 404;
        throw err;
    }

    return {
        user: { 
            _id: user._id, 
            name: user.name, 
            email: user.email, 
            role: user.role, 
            avatar: user.avatar || user.profilePic
        }
    };
};

export const logout = async (userId) => {
    await User.findByIdAndUpdate(userId, { refreshToken: null });
};
