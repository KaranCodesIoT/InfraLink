/**
 * AI Constants — model names, token limits, and configuration defaults.
 */

export const AI_MODELS = {
    GEMINI_PRO: 'gemini-pro',
    GEMINI_PRO_VISION: 'gemini-pro-vision',
    GEMINI_1_5_PRO: 'gemini-1.5-pro',
    GEMINI_1_5_FLASH: 'gemini-1.5-flash',
};

export const TOKEN_LIMITS = {
    MAX_INPUT_TOKENS: 30000,
    MAX_OUTPUT_TOKENS: 8192,
    MAX_CONTEXT_TOKENS: 32000,
    CHATBOT_MAX_HISTORY: 20,        // max messages to keep in context
    ASSISTANT_MAX_HISTORY: 50,
};

export const AI_ROLES = {
    SYSTEM: 'system',
    USER: 'user',
    ASSISTANT: 'model',
};

export const CHATBOT_DEFAULTS = {
    TEMPERATURE: 0.7,
    TOP_P: 0.9,
    TOP_K: 40,
    MAX_OUTPUT_TOKENS: 2048,
    SESSION_TTL_MINUTES: 30,
};

export const VOICE_DEFAULTS = {
    STT_LANGUAGE: 'en-IN',
    TTS_LANGUAGE: 'en-IN',
    TTS_VOICE: 'en-IN-Standard-A',
    AUDIO_ENCODING: 'LINEAR16',
    SAMPLE_RATE: 16000,
    MAX_AUDIO_DURATION_SECONDS: 60,
};

export const VISION_DEFAULTS = {
    MAX_IMAGE_SIZE_MB: 10,
    SUPPORTED_FORMATS: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    MAX_IMAGES_PER_REQUEST: 5,
};

export const ESCALATION_STATUS = {
    PENDING: 'pending',
    ASSIGNED: 'assigned',
    IN_PROGRESS: 'in_progress',
    RESOLVED: 'resolved',
    CLOSED: 'closed',
};

export const AI_ERROR_CODES = {
    MODEL_OVERLOADED: 'AI_MODEL_OVERLOADED',
    CONTEXT_TOO_LONG: 'AI_CONTEXT_TOO_LONG',
    CONTENT_FILTERED: 'AI_CONTENT_FILTERED',
    VISION_UNSUPPORTED_FORMAT: 'AI_VISION_UNSUPPORTED_FORMAT',
    STT_FAILED: 'AI_STT_FAILED',
    TTS_FAILED: 'AI_TTS_FAILED',
    ESCALATION_FAILED: 'AI_ESCALATION_FAILED',
    SESSION_EXPIRED: 'AI_SESSION_EXPIRED',
};
