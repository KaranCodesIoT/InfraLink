import Joi from 'joi';

export const createPaymentSchema = Joi.object({
    payee: Joi.string().required(),
    amount: Joi.number().min(1).required(),
    currency: Joi.string().default('INR'),
    job: Joi.string().optional(),
    project: Joi.string().optional(),
    description: Joi.string(),
});

export const verifyPaymentSchema = Joi.object({
    orderId: Joi.string().required(),
    paymentId: Joi.string().required(),
    signature: Joi.string().required(),
});
