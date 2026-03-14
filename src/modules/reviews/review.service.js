import Review from './review.model.js';
import WorkerProfile from '../workers/workerProfile.model.js';
import { getPagination, buildPaginationMeta } from '../../utils/pagination.utils.js';

export const createReview = async (reviewerId, data) => {
    const review = await Review.create({ ...data, reviewer: reviewerId });
    // Update worker's average rating
    const stats = await Review.aggregate([
        { $match: { reviewee: review.reviewee } },
        { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    if (stats.length) {
        await WorkerProfile.findOneAndUpdate(
            { user: review.reviewee },
            { averageRating: stats[0].avg.toFixed(2), totalReviews: stats[0].count }
        );
    }
    return review;
};

export const getReviewsForUser = async (userId, query) => {
    const { page, limit, skip } = getPagination(query);
    const [reviews, total] = await Promise.all([
        Review.find({ reviewee: userId }).populate('reviewer', 'name avatar').sort('-createdAt').skip(skip).limit(limit),
        Review.countDocuments({ reviewee: userId }),
    ]);
    return { reviews, pagination: buildPaginationMeta(total, page, limit) };
};
