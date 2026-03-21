import rateLimit from 'express-rate-limit';
import { sendError } from '../utils/response.utils.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

export const defaultLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || (process.env.NODE_ENV === 'production' ? 100 : 50000),
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) =>
        sendError(res, 'Too many requests, please try again later.', HTTP_STATUS.TOO_MANY_REQUESTS, ERROR_CODES.RATE_LIMIT_EXCEEDED),
});

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: process.env.NODE_ENV === 'production' ? 10 : 10000,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) =>
        sendError(res, 'Too many auth attempts. Try again in 15 minutes.', HTTP_STATUS.TOO_MANY_REQUESTS, ERROR_CODES.RATE_LIMIT_EXCEEDED),
});
