import Joi from 'joi';
import { ALL_ROLES } from '../../constants/roles.js';

const locationSchema = Joi.object({
    address: Joi.string(),
    city: Joi.string(),
    state: Joi.string(),
    coordinates: Joi.array().items(Joi.number()).length(2),
});

const priceSchema = Joi.object({
    amount: Joi.number().min(0),
    currency: Joi.string().default('INR'),
    type: Joi.string().valid('fixed', 'hourly', 'daily', 'negotiable').default('negotiable'),
});

export const createServiceSchema = Joi.object({
    providerRole: Joi.string().valid(...ALL_ROLES).required(),
    serviceType: Joi.string()
        .valid('construction', 'architecture', 'labour', 'interior', 'renovation', 'electrical', 'plumbing', 'structural')
        .required(),
    title: Joi.string().min(5).max(200).required(),
    description: Joi.string().min(10).max(3000).required(),
    location: locationSchema,
    price: priceSchema,
});

export const applyToServiceSchema = Joi.object({
    message: Joi.string().max(1000).optional(),
    proposedPrice: Joi.number().min(0).optional(),
});

export const updateStatusSchema = Joi.object({
    status: Joi.string()
        .valid('in_progress', 'completed', 'cancelled', 'disputed')
        .required(),
});
