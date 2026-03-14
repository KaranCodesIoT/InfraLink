import Joi from 'joi';

export const createApplicationSchema = Joi.object({
    job: Joi.string().required(),
    coverLetter: Joi.string().max(2000),
    proposedRate: Joi.number().min(0),
});

export const updateApplicationSchema = Joi.object({
    status: Joi.string().valid('shortlisted', 'rejected', 'hired', 'withdrawn').required(),
});
