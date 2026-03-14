import { verifyAccessToken } from '../utils/token.utils.js';
import { sendError } from '../utils/response.utils.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { ERROR_CODES } from '../constants/errorCodes.js';
import User from '../modules/users/user.model.js';

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return sendError(res, 'No token provided', HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.UNAUTHORIZED);
        }

        const token = authHeader.split(' ')[1];
        const decoded = verifyAccessToken(token);

        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            return sendError(res, 'User not found', HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.UNAUTHORIZED);
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return sendError(res, 'Token expired', HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.TOKEN_EXPIRED);
        }
        return sendError(res, 'Invalid token', HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.TOKEN_INVALID);
    }
};

export default authMiddleware;
