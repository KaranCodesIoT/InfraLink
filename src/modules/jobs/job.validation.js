import Joi from 'joi';

export const createJobSchema = Joi.object({
    title: Joi.string().min(5).max(200).required(),
    description: Joi.string().min(20).required(),
    requiredSkills: Joi.array().items(Joi.string()).min(1).required(),
    budget: Joi.object({ min: Joi.number(), max: Joi.number(), currency: Joi.string() }),
    duration: Joi.object({ value: Joi.number(), unit: Joi.string().valid('days', 'weeks', 'months') }),
    location: Joi.object({
        coordinates: Joi.array().items(Joi.number()).length(2),
        address: Joi.string(),
        city: Joi.string(),
        state: Joi.string(),
    }),
    isUrgent: Joi.boolean().default(false),
});

export const updateJobSchema = createJobSchema.fork(
    ['title', 'description', 'requiredSkills'],
    (s) => s.optional()
).append({ status: Joi.string().valid('draft', 'open', 'in_progress', 'completed', 'cancelled', 'on_hold') });
