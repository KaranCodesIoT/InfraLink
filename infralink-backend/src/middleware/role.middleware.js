import { sendError } from '../utils/response.utils.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

/**
 * Factory that returns middleware restricting access to specified roles.
 * @param {...string} roles
 */
const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return sendError(res, 'Not authenticated', HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.UNAUTHORIZED);
        }
        if (!roles.includes(req.user.role)) {
            return sendError(
                res,
                `Access denied. Required roles: ${roles.join(', ')}`,
                HTTP_STATUS.FORBIDDEN,
                ERROR_CODES.FORBIDDEN
            );
        }
        next();
    };
};

export default requireRole;
