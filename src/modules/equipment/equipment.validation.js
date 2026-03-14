import Joi from 'joi';

export const equipmentSchema = Joi.object({
    name: Joi.string().required(),
    description: Joi.string(),
    category: Joi.string(),
    dailyRate: Joi.number().min(0).required(),
    weeklyRate: Joi.number().min(0),
    isAvailable: Joi.boolean(),
    condition: Joi.string().valid('new', 'excellent', 'good', 'fair'),
    location: Joi.object({ coordinates: Joi.array().items(Joi.number()).length(2), city: Joi.string() }),
});
