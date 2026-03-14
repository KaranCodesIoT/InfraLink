import { getModel } from '../../../config/ai.js';
import AssistantContext from './assistant.context.model.js';
import { AI_MODELS, CHATBOT_DEFAULTS, AI_ROLES } from '../../../constants/aiConstants.js';
import { buildAssistantContext } from '../../../utils/contextBuilder.utils.js';
import logger from '../../../utils/logger.js';

const getOrCreateContext = async (userId) => {
    let ctx = await AssistantContext.findOne({ user: userId });
    if (!ctx) ctx = await AssistantContext.create({ user: userId });
    return ctx;
};

export const ask = async (userId, question, userProfile = null) => {
    const ctx = await getOrCreateContext(userId);

    ctx.conversationHistory.push({ role: AI_ROLES.USER, content: question });

    const contextMessages = buildAssistantContext(ctx.persona, ctx.conversationHistory, userProfile);

    try {
        const model = getModel(AI_MODELS.GEMINI_1_5_PRO);
        const chat = model.startChat({
            history: contextMessages.slice(0, -1).map(m => ({
                role: m.role === 'system' ? AI_ROLES.USER : m.role,
                parts: [{ text: m.content }],
            })),
            generationConfig: {
                temperature: CHATBOT_DEFAULTS.TEMPERATURE,
                maxOutputTokens: CHATBOT_DEFAULTS.MAX_OUTPUT_TOKENS,
            },
        });

        const result = await chat.sendMessage(question);
        const answer = result.response.text().trim();

        ctx.conversationHistory.push({ role: AI_ROLES.ASSISTANT, content: answer });
        ctx.lastInteraction = new Date();
        await ctx.save();

        return answer;
    } catch (error) {
        logger.error(`Assistant error: ${error.message}`);
        throw error;
    }
};

export const updateMemory = async (userId, memoryUpdate) => {
    const ctx = await getOrCreateContext(userId);
    ctx.longTermMemory = { ...ctx.longTermMemory, ...memoryUpdate };
    await ctx.save();
    return ctx.longTermMemory;
};

export const clearHistory = async (userId) => {
    const ctx = await getOrCreateContext(userId);
    ctx.conversationHistory = [];
    await ctx.save();
};

export const getContext = async (userId) => getOrCreateContext(userId);
