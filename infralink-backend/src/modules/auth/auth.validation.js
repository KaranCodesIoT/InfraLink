import Joi from 'joi';
import { ROLES } from '../../constants/roles.js';

export const registerSchema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    phone: Joi.string().optional(),
    role: Joi.string().valid(...Object.values(ROLES)).optional(),
    location: Joi.object({
        address: Joi.string(),
        city: Joi.string(),
        state: Joi.string(),
    }).optional(),
});


export const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

export const refreshTokenSchema = Joi.object({
    refreshToken: Joi.string().required(),
});

export const changePasswordSchema = Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(8).required(),
});
