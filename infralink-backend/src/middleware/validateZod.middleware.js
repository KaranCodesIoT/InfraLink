import { sendError } from '../utils/response.utils.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

/**
 * Factory that validates req.body (or other source) with a Zod schema.
 * @param {import('zod').ZodSchema} schema
 * @param {'body'|'query'|'params'} source
 */
export const validateZod = (schema, source = 'body') => {
    return (req, res, next) => {
        try {
            const parsedData = schema.parse(req[source]);
            req[source] = parsedData;
            next();
        } catch (error) {
            // Check if it's a ZodError
            if (error.errors) {
                const details = error.errors.map(err => {
                    const path = err.path.length > 0 ? `${err.path.join('.')}: ` : '';
                    return `${path}${err.message}`;
                });
                return sendError(
                    res,
                    'Validation failed',
                    HTTP_STATUS.BAD_REQUEST,
                    ERROR_CODES.VALIDATION_ERROR,
                    details
                );
            }
            // Fallback for other unexpected errors
            return sendError(
                res,
                'Validation failed',
                HTTP_STATUS.BAD_REQUEST,
                ERROR_CODES.VALIDATION_ERROR,
                [error.message]
            );
        }
    };
};
