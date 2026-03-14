import Joi from 'joi';

// ─── Chatbot ──────────────────────────────────────────────────────────────────
export const createSessionSchema = Joi.object({
    context: Joi.string().max(2000).optional(),
});

export const chatSchema = Joi.object({
    message: Joi.string().min(1).max(4000).required(),
});

// ─── Assistant ────────────────────────────────────────────────────────────────
export const askAssistantSchema = Joi.object({
    question: Joi.string().min(1).max(4000).required(),
});

export const updateMemorySchema = Joi.object({
    preferences: Joi.object().optional(),
    notes: Joi.array().items(Joi.string()).optional(),
});

// ─── Vision ───────────────────────────────────────────────────────────────────
export const analyseImageSchema = Joi.object({
    prompt: Joi.string().max(500).optional(),
    mode: Joi.string().valid('general', 'labels', 'damage').default('general'),
});

// ─── Voice ───────────────────────────────────────────────────────────────────
export const sttSchema = Joi.object({
    languageCode: Joi.string().default('en-IN'),
});

export const ttsSchema = Joi.object({
    text: Joi.string().min(1).max(5000).required(),
    languageCode: Joi.string().default('en-IN'),
    voiceName: Joi.string().optional(),
});

// ─── Escalation ───────────────────────────────────────────────────────────────
export const createEscalationSchema = Joi.object({
    subject: Joi.string().min(5).max(200).required(),
    description: Joi.string().min(10).max(3000).required(),
    chatSession: Joi.string().optional(),
    priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium'),
    attachments: Joi.array().items(Joi.string()).optional(),
});

export const resolveEscalationSchema = Joi.object({
    resolution: Joi.string().min(5).max(2000).required(),
});
