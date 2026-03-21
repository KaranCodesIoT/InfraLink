import { checkBlockExists } from '../services/block.service.js';
import { HTTP_STATUS } from '../../../constants/httpStatus.js';

/**
 * Global middleware enforcing block invisibility.
 * Usage: router.get('/profile/:userId', verifyBlock, getProfile);
 * 
 * Assumes req.user is populated by authenticate middleware.
 * Assumes the target user's ID is reliably at req.params.targetId or req.params.userId.
 */
export const verifyBlock = async (req, res, next) => {
    try {
        if (!req.user) return next();
        
        // Detect target ID from params, body, or common fields
        const targetId = req.params.targetId || 
                         req.params.userId || 
                         req.params.id || 
                         req.body.recipientId || 
                         req.body.userId;
        
        if (!targetId) return next();

        const isBlocked = await checkBlockExists(req.user.id, targetId);
        if (isBlocked) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: 'User not found or account unavailable'
            });
        }
        
        next();
    } catch (error) {
        next(error);
    }
};
