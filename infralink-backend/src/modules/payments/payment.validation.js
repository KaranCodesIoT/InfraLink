import Joi from 'joi';

export const createPaymentSchema = Joi.object({
    payeeEmail: Joi.string().email().required(),
    amount: Joi.number().min(1).required(),
    currency: Joi.string().default('INR'),
    job: Joi.string().optional(),
    project: Joi.string().optional(),
    description: Joi.string().allow('').optional(),
});

export const verifyPaymentSchema = Joi.object({
    orderId: Joi.string().required(),
    razorpayPaymentId: Joi.string().required(),
    signature: Joi.string().required(),
});
