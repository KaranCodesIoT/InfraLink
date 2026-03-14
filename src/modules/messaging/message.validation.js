import Joi from 'joi';

export const sendMessageSchema = Joi.object({
    recipientId: Joi.string().required(),
    jobId: Joi.string().optional(),
    content: Joi.string().min(1).max(2000),
});
