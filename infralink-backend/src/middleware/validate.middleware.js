import { sendError } from '../utils/response.utils.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

/**
 * Factory that validates req.body with a Joi schema.
 * @param {import('joi').Schema} schema
 * @param {'body'|'query'|'params'} source
 */
const validate = (schema, source = 'body') => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req[source], {
            abortEarly: false,
            stripUnknown: true,
        });

        if (error) {
            const details = error.details.map((d) => d.message);
            return sendError(
                res,
                'Validation failed',
                HTTP_STATUS.BAD_REQUEST,
                ERROR_CODES.VALIDATION_ERROR,
                details
            );
        }

        req[source] = value;
        next();
    };
};

export default validate;
