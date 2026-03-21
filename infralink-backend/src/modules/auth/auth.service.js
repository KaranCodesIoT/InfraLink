import User from '../users/user.model.js';
import { hashPassword, comparePassword } from '../../utils/encryption.utils.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../utils/token.utils.js';

export const register = async ({ name, email, password, role, phone, location }) => {
    const existing = await User.findOne({ email });
    if (existing) {
        const err = new Error('Email already in use');
        err.statusCode = 409;
        err.code = 'CONFLICT';
        throw err;
    }

    const hashed = await hashPassword(password);
    const assignedRole = role || 'unassigned';
    const user = await User.create({ name, email, password: hashed, role: assignedRole, phone, location });

    const accessToken = signAccessToken({ id: user._id, role: user.role });
    const refreshToken = signRefreshToken({ id: user._id });

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { user: { _id: user._id, name, email, role: user.role, avatar: user.avatar }, accessToken, refreshToken };
};

export const login = async ({ email, password }) => {
    const user = await User.findOne({ email }).select('+password +refreshToken');
    if (!user || !(await comparePassword(password, user.password))) {
        const err = new Error('Invalid email or password');
        err.statusCode = 401;
        err.code = 'INVALID_CREDENTIALS';
        throw err;
    }

    const accessToken = signAccessToken({ id: user._id, role: user.role });
    const refreshToken = signRefreshToken({ id: user._id });

    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    return {
        user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
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
