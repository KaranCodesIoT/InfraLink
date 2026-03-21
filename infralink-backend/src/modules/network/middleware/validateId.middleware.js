import mongoose from 'mongoose';
import { HTTP_STATUS } from '../../../constants/httpStatus.js';

/**
 * Middleware: Validate that specified route params are valid MongoDB ObjectIds.
 * Returns 400 Bad Request with a clean error if any param is invalid.
 * 
 * Usage: router.get('/:targetId', validateObjectId('targetId'), handler)
 */
export const validateObjectId = (...paramNames) => {
    return (req, res, next) => {
        for (const param of paramNames) {
            const value = req.params[param];
            if (value && !mongoose.Types.ObjectId.isValid(value)) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: `Invalid ID format: ${param}`
                });
            }
        }
        next();
    };
};
