import Follow from '../models/follow.model.js';
import { HTTP_STATUS } from '../../../constants/httpStatus.js';

/**
 * Middleware: Enforce follow requirement for messaging.
 * Messaging is allowed once ANY follow exists in EITHER direction (A→B or B→A).
 * This is checked at the backend level — frontend should mirror this logic.
 * Must be applied AFTER auth middleware so req.user is available.
 */
export const verifyFollowExists = async (req, res, next) => {
    try {
        if (!req.user) return next();

        const recipientId = req.body.recipientId;
        if (!recipientId) return next(); // No recipient specified (e.g. fetching conversations)

        if (req.user.id.toString() === recipientId.toString()) return next(); // Self handled elsewhere

        // Check if ANY follow exists in either direction with status 'accepted'
        const followExists = await Follow.findOne({
            $or: [
                { follower: req.user.id, following: recipientId, status: 'accepted' },
                { follower: recipientId, following: req.user.id, status: 'accepted' }
            ]
        }).lean();

        if (!followExists) {
            return res.status(HTTP_STATUS.FORBIDDEN).json({
                success: false,
                message: 'Messaging requires a follow relationship. Follow this user first.'
            });
        }

        next();
    } catch (error) {
        next(error);
    }
};
