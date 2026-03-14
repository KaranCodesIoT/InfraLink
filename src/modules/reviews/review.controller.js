import * as reviewService from './review.service.js';
import { sendCreated, sendPaginatedSuccess } from '../../utils/response.utils.js';

export const createReview = async (req, res, next) => {
    try { sendCreated(res, await reviewService.createReview(req.user._id, req.body), 'Review submitted'); }
    catch (e) { next(e); }
};

export const getReviewsForUser = async (req, res, next) => {
    try {
        const { reviews, pagination } = await reviewService.getReviewsForUser(req.params.userId, req.query);
        sendPaginatedSuccess(res, reviews, pagination);
    } catch (e) { next(e); }
};
