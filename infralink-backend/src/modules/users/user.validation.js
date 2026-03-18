import Joi from 'joi';
import { ROLES } from '../../constants/roles.js';

export const updateUserSchema = Joi.object({
    name: Joi.string().min(2).max(100),
    phone: Joi.string(),
    role: Joi.string().valid(...Object.values(ROLES).filter(r => r !== 'unassigned')),
    skills: Joi.array().items(Joi.string().trim()),
    experience: Joi.string().allow(''),
    bio: Joi.string().allow(''),
    location: Joi.object({
        coordinates: Joi.array().items(Joi.number()).length(2),
        address: Joi.string().allow(''),
        city: Joi.string().allow(''),
        state: Joi.string().allow(''),
    }),
});
