import { HTTP_STATUS } from '../constants/httpStatus.js';

export const sendSuccess = (res, data = null, message = 'Success', statusCode = HTTP_STATUS.OK) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
    });
};

export const sendCreated = (res, data = null, message = 'Created successfully') => {
    return sendSuccess(res, data, message, HTTP_STATUS.CREATED);
};

export const sendError = (res, message = 'An error occurred', statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, code = null, details = null) => {
    return res.status(statusCode).json({
        success: false,
        error: {
            code,
            message,
            ...(details && { details }),
        },
    });
};

export const sendPaginatedSuccess = (res, data, pagination) => {
    return res.status(HTTP_STATUS.OK).json({
        success: true,
        data,
        pagination,
    });
};
