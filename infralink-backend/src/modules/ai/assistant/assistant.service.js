import { getModel } from '../../../config/ai.js';
import AssistantContext from './assistant.context.model.js';
import User from '../../users/user.model.js';
import { AI_MODELS, CHATBOT_DEFAULTS, AI_ROLES } from '../../../constants/aiConstants.js';
import { buildAssistantContext } from '../../../utils/contextBuilder.utils.js';
import logger from '../../../utils/logger.js';

// Define the tools (Function Calling)
const assistantTools = [{
    functionDeclarations: [
        {
            name: "findAvailableWorkers",
            description: "Find available workers or professionals on the platform by their role (e.g., contractor, architect, labour)",
            parameters: {
                type: "OBJECT",
                properties: {
                    role: {
                        type: "STRING",
                        description: "The role to search for. Must be one of: contractor, architect, labour, supplier"
                    }
                },
                required: ["role"]
            }
        }
    ]
}];

const executeTool = async (functionCall) => {
    if (functionCall.name === 'findAvailableWorkers') {
        const { role } = functionCall.args;
        try {
            const workers = await User.find({ role: role.toLowerCase() })
                .select('name city rating hourlyRate')
                .limit(5)
                .lean();

            if (!workers.length) return { message: `No workers found with role ${role}` };
            return { workers };
        } catch (e) {
            return { error: 'Database query failed' };
        }
    }
    return { error: 'Unknown function' };
};

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
            tools: assistantTools,
            generationConfig: {
                temperature: CHATBOT_DEFAULTS.TEMPERATURE,
                maxOutputTokens: CHATBOT_DEFAULTS.MAX_OUTPUT_TOKENS,
            },
        });

        let result = await chat.sendMessage(question);

        // Handle potential function call
        if (result.response.functionCalls && result.response.functionCalls.length > 0) {
            const call = result.response.functionCalls[0];
            const apiResponse = await executeTool(call);

            // Send the result back to Gemini so it can answer the user
            result = await chat.sendMessage([{
                functionResponse: {
                    name: call.name,
                    response: apiResponse
                }
            }]);
        }

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
