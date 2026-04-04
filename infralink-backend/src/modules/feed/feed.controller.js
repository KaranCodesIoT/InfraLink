import * as feedService from './feed.service.js';
import { sendPaginatedSuccess, sendError } from '../../utils/response.utils.js';
import { HTTP_STATUS } from '../../constants/httpStatus.js';

/**
 * Fetch a personalized feed for the logged-in user.
 */
export const getFeed = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 15;

        if (!req.user) {
            return sendError(res, 'User identity not found', HTTP_STATUS.UNAUTHORIZED);
        }

        const data = await feedService.getPersonalizedFeed(
            req.user._id,
            req.user.role,
            page,
            limit
        );

        return sendPaginatedSuccess(res, data.posts, data.pagination);
    } catch (error) {
        next(error);
    }
};
