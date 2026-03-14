import Joi from 'joi';

export const createReviewSchema = Joi.object({
    reviewee: Joi.string().required(),
    job: Joi.string().required(),
    rating: Joi.number().min(1).max(5).required(),
    comment: Joi.string().max(1000),
    tags: Joi.array().items(Joi.string()),
});
