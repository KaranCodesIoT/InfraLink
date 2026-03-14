import Joi from 'joi';

export const workerProfileSchema = Joi.object({
    skills: Joi.array().items(Joi.string()),
    yearsOfExperience: Joi.number().min(0),
    trade: Joi.string(),
    bio: Joi.string().max(1000),
    isAvailable: Joi.boolean(),
    hourlyRate: Joi.number().min(0),
    dailyRate: Joi.number().min(0),
    location: Joi.object({
        coordinates: Joi.array().items(Joi.number()).length(2),
        address: Joi.string(),
        city: Joi.string(),
        radius: Joi.number().min(0),
    }),
});
