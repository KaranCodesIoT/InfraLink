/**
 * Context Builder — assembles AI conversation context for Gemini chat sessions.
 */
import { TOKEN_LIMITS, AI_ROLES } from '../constants/aiConstants.js';

/**
 * Build the conversation history array for Gemini startChat().
 * - Prepends the system prompt as the first user + model pair
 * - Trims to the last N messages to stay within token limits
 *
 * @param {string} systemPrompt
 * @param {{ role: string, content: string }[]} messages
 * @returns {{ role: string, content: string }[]}
 */
export const buildContext = (systemPrompt, messages) => {
    const history = [];

    // Gemini doesn't have a system role — simulate with first user/model exchange
    if (systemPrompt) {
        history.push({ role: AI_ROLES.USER, content: `[SYSTEM]: ${systemPrompt}` });
        history.push({ role: AI_ROLES.ASSISTANT, content: 'Understood. I will follow these instructions.' });
    }

    // Trim to last N message pairs to avoid context overflow
    const maxMessages = TOKEN_LIMITS.CHATBOT_MAX_HISTORY * 2;
    const trimmed = messages.length > maxMessages
        ? messages.slice(-maxMessages)
        : messages;

    history.push(...trimmed);
    return history;
};

/**
 * Build context for the personal assistant (longer history limit).
 */
export const buildAssistantContext = (systemPrompt, messages, userProfile = null) => {
    const profileContext = userProfile
        ? `\n\nUser Profile: Name=${userProfile.name}, Role=${userProfile.role}, Location=${userProfile.location?.address || 'Unknown'}`
        : '';

    return buildContext(
        (systemPrompt || 'You are InfraLink Personal Assistant.') + profileContext,
        messages.slice(-TOKEN_LIMITS.ASSISTANT_MAX_HISTORY * 2)
    );
};

/**
 * Estimate rough token count (1 token ≈ 4 characters).
 */
export const estimateTokens = (text) => Math.ceil(text.length / 4);

/**
 * Check if adding a message would exceed the token limit.
 */
export const wouldExceedLimit = (messages, newMessage, limit = TOKEN_LIMITS.MAX_CONTEXT_TOKENS) => {
    const total = messages.reduce((sum, m) => sum + estimateTokens(m.content), 0);
    return total + estimateTokens(newMessage) > limit;
};
