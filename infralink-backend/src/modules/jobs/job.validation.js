import Joi from 'joi';

export const createJobSchema = Joi.object({
    title: Joi.string().min(5).max(200).required(),
    description: Joi.string().min(10).required(),
    category: Joi.string().valid('builder', 'contractor', 'architect', 'labour', 'supplier', 'general').default('general'),
    requiredSkills: Joi.array().items(Joi.string()).default([]),
    budget: Joi.object({
        min: Joi.number().min(0).allow(null),
        max: Joi.number().min(0).allow(null),
        currency: Joi.string().default('INR'),
    }),
    location: Joi.object({
        coordinates: Joi.array().items(Joi.number()).length(2),
        address: Joi.string().allow('', null),
        city: Joi.string().allow('', null),
        state: Joi.string().allow('', null),
    }),
    deadline: Joi.date().iso().allow(null),
    contactDetails: Joi.object({
        name: Joi.string().allow('', null),
        phone: Joi.string().allow('', null),
        email: Joi.string().email({ tlds: { allow: false } }).allow('', null),
    }),
    isUrgent: Joi.boolean().default(false),
});

export const updateJobSchema = createJobSchema.fork(
    ['title', 'description', 'category'],
    (s) => s.optional()
).append({ status: Joi.string().valid('draft', 'open', 'in_progress', 'completed', 'cancelled', 'on_hold') });
