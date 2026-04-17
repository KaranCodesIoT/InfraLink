import Joi from 'joi';

const objectId = Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .messages({ 'string.pattern.base': '{#label} must be a valid MongoDB ObjectId' });

// ─── Send Message Request ─────────────────────────────────────────────────────
export const messageRequestSchema = Joi.object({
    recipientId: objectId.required(),
    text: Joi.string().min(1).max(5000).required(),
    projectContext: Joi.object({
        name: Joi.string().max(200).allow(''),
        budget: Joi.string().max(100).allow(''),
        location: Joi.string().max(200).allow(''),
    }).optional(),
    workIntent: Joi.string().valid('hire_now', 'request_quote').optional(),
});

// ─── Get or Create Conversation ───────────────────────────────────────────────
export const conversationSchema = Joi.object({
    recipientId: objectId.required(),
    projectContext: Joi.object({
        name: Joi.string().max(200).allow(''),
        budget: Joi.string().max(100).allow(''),
        location: Joi.string().max(200).allow(''),
    }).optional(),
    workIntent: Joi.string().valid('hire_now', 'request_quote').optional(),
});

// ─── Send Message (within accepted conversation) ─────────────────────────────
export const sendMessageSchema = Joi.object({
    conversationId: objectId.required(),
    text: Joi.string().max(5000).optional().allow('', null),
    attachments: Joi.array()
        .items(
            Joi.object({
                url: Joi.string().uri().required(),
                type: Joi.string().valid('image', 'pdf', 'location').required(),
                name: Joi.string().max(255).optional(),
                size: Joi.number().integer().positive().optional(),
            })
        )
        .max(10)
        .optional(),
}).custom((value, helpers) => {
    const hasText = value.text && value.text.trim().length > 0;
    const hasAttachments = value.attachments && value.attachments.length > 0;
    if (!hasText && !hasAttachments) {
        return helpers.error('any.invalid', { message: 'Message must have text or at least one attachment' });
    }
    return value;
}, 'text-or-attachment check');

// ─── Mark messages as seen ────────────────────────────────────────────────────
export const markSeenSchema = Joi.object({
    conversationId: objectId.required(),
});
