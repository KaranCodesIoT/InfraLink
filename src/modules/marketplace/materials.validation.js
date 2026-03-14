import Joi from 'joi';

export const materialSchema = Joi.object({
    name: Joi.string().required(),
    description: Joi.string(),
    category: Joi.string(),
    price: Joi.number().min(0).required(),
    unit: Joi.string(),
    quantity: Joi.number().min(0),
    isAvailable: Joi.boolean(),
    location: Joi.object({ coordinates: Joi.array().items(Joi.number()).length(2), city: Joi.string() }),
});
