import { getModel } from '../../../config/ai.js';
import ChatbotSession from './chatbot.session.model.js';
import { AI_MODELS, CHATBOT_DEFAULTS, AI_ROLES } from '../../../constants/aiConstants.js';
import { buildContext } from '../../../utils/contextBuilder.utils.js';
import logger from '../../../utils/logger.js';

export const createSession = async (userId, context = null) => {
    return ChatbotSession.create({
        user: userId,
        context: context || 'You are InfraLink AI — a helpful construction industry assistant. Help users with job postings, worker searches, project planning, material inquiries, and platform navigation. Be concise and professional.',
    });
};

export const getSession = async (sessionId, userId) => {
    const session = await ChatbotSession.findOne({ _id: sessionId, user: userId, isActive: true });
    if (!session) {
        const e = new Error('Chat session not found or expired');
        e.statusCode = 404;
        throw e;
    }
    return session;
};

export const getUserSessions = async (userId) => {
    return ChatbotSession.find({ user: userId, isActive: true })
        .select('title lastActivity createdAt')
        .sort('-lastActivity')
        .limit(50);
};

export const chat = async (sessionId, userId, userMessage) => {
    const session = await getSession(sessionId, userId);

    // Add user message
    session.messages.push({ role: AI_ROLES.USER, content: userMessage });

    // Build prompt with context
    const contextMessages = buildContext(session.context, session.messages);

    try {
        const model = getModel(AI_MODELS.GEMINI_1_5_FLASH);
        const chatInstance = model.startChat({
            history: contextMessages.slice(0, -1).map(m => ({
                role: m.role,
                parts: [{ text: m.content }],
            })),
            generationConfig: {
                temperature: CHATBOT_DEFAULTS.TEMPERATURE,
                topP: CHATBOT_DEFAULTS.TOP_P,
                topK: CHATBOT_DEFAULTS.TOP_K,
                maxOutputTokens: CHATBOT_DEFAULTS.MAX_OUTPUT_TOKENS,
            },
        });

        const result = await chatInstance.sendMessage(userMessage);
        const aiResponse = result.response.text().trim();

        // Add AI response
        session.messages.push({ role: AI_ROLES.ASSISTANT, content: aiResponse });
        session.lastActivity = new Date();

        // Auto-title from first exchange
        if (session.messages.length <= 2) {
            session.title = userMessage.substring(0, 60);
        }

        await session.save();
        return { response: aiResponse, sessionId: session._id };
    } catch (error) {
        logger.error(`Chatbot error: ${error.message}`);
        throw error;
    }
};

export const deleteSession = async (sessionId, userId) => {
    await ChatbotSession.findOneAndUpdate(
        { _id: sessionId, user: userId },
        { isActive: false }
    );
};
