import Joi from 'joi';

export const createApplicationSchema = Joi.object({
    job: Joi.string().required(),
    message: Joi.string().max(3000).allow('', null),
    coverLetter: Joi.string().max(3000).allow('', null),
    proposedRate: Joi.number().min(0).allow(null),
    contactDetails: Joi.object({
        phone: Joi.string().allow('', null),
        email: Joi.string().email({ tlds: { allow: false } }).allow('', null),
    }),
});

export const updateApplicationSchema = Joi.object({
    status: Joi.string().valid('shortlisted', 'rejected', 'hired', 'withdrawn').required(),
});
