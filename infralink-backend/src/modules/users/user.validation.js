import Joi from 'joi';

export const updateUserSchema = Joi.object({
    name: Joi.string().min(2).max(100),
    phone: Joi.string(),
    location: Joi.object({
        coordinates: Joi.array().items(Joi.number()).length(2),
        address: Joi.string(),
        city: Joi.string(),
        state: Joi.string(),
    }),
});
