import Joi from 'joi';
import { ROLES } from '../../constants/roles.js';
import { CONTRACTOR_TYPES, PROFESSION_TYPES } from './user.model.js';

export const updateUserSchema = Joi.object({
    name: Joi.string().min(2).max(100),
    phone: Joi.string(),
    role: Joi.string().valid(...Object.values(ROLES).filter(r => r !== 'unassigned')),
    contractorType: Joi.string().valid(...CONTRACTOR_TYPES).allow('', null),
    professionType: Joi.string().valid(...PROFESSION_TYPES).allow('', null),
    skills: Joi.array().items(Joi.string().trim()),
    experience: Joi.string().allow(''),
    bio: Joi.string().allow(''),
    location: Joi.object({
        coordinates: Joi.array().items(Joi.number()).length(2),
        address: Joi.string().allow(''),
        city: Joi.string().allow(''),
        state: Joi.string().allow(''),
    }),
    kycDetails: Joi.object({
        aadhaarNumber: Joi.string().allow('', null),
        panNumber: Joi.string().allow('', null),
        gstin: Joi.string().allow('', null),
        reraRegistrationNumber: Joi.string().allow('', null)
    }).allow(null),
    professionalDetails: Joi.object({
        pricing: Joi.object({
            amount: Joi.number().allow(null),
            type: Joi.string().allow('', null)
        }).allow(null),
        skillLevel: Joi.string().allow('', null),
        tools: Joi.array().items(Joi.string().allow('', null)).allow(null)
    }).allow(null),
    resume: Joi.string().allow('', null),
});
