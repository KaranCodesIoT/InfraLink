import { sendError } from '../utils/response.utils.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { ERROR_CODES } from '../constants/errorCodes.js';
import logger from '../utils/logger.js';

// eslint-disable-next-line no-unused-vars
const errorMiddleware = (err, req, res, next) => {
    logger.error({
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
    });

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const details = Object.values(err.errors).map((e) => e.message);
        return sendError(res, 'Validation failed', HTTP_STATUS.UNPROCESSABLE_ENTITY, ERROR_CODES.VALIDATION_ERROR, details);
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue || {})[0];
        return sendError(res, `${field} already exists`, HTTP_STATUS.CONFLICT, ERROR_CODES.DUPLICATE_ENTRY);
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return sendError(res, 'Invalid token', HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.TOKEN_INVALID);
    }

    const statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
    return sendError(
        res,
        err.message || 'Internal server error',
        statusCode,
        err.code || ERROR_CODES.INTERNAL_ERROR
    );
};

export default errorMiddleware;
