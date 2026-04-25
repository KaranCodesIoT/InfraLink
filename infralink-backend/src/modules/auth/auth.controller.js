import * as authService from './auth.service.js';
import { sendSuccess, sendCreated, sendError } from '../../utils/response.utils.js';
import { HTTP_STATUS } from '../../constants/httpStatus.js';

export const sendOtp = async (req, res, next) => {
    try {
        const result = await authService.sendOtp(req.body);
        return sendSuccess(res, result, 'OTP sent successfully');
    } catch (error) {
        next(error);
    }
};

export const verifyOtp = async (req, res, next) => {
    try {
        const result = await authService.verifyOtp(req.body);
        return sendSuccess(res, result, 'Login successful');
    } catch (error) {
        next(error);
    }
};

export const refreshToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        const tokens = await authService.refreshTokens(refreshToken);
        return sendSuccess(res, tokens, 'Tokens refreshed');
    } catch (error) {
        next(error);
    }
};

export const logout = async (req, res, next) => {
    try {
        await authService.logout(req.user._id);
        return sendSuccess(res, null, 'Logged out successfully');
    } catch (error) {
        next(error);
    }
};

export const getMe = (req, res) => {
    return sendSuccess(res, req.user, 'Current user');
};
