import { getModel } from '../../config/ai.js';
import { buildMatchPrompt } from '../../utils/aiPrompt.utils.js';
import logger from '../../utils/logger.js';

export const runAiMatching = async (job, workers) => {
    try {
        const model = getModel('gemini-pro');
        const prompt = buildMatchPrompt(job, workers);
        const result = await model.generateContent(prompt);
        return JSON.parse(result.response.text().trim());
    } catch (error) {
        logger.error(`AI engine error: ${error.message}`);
        throw error;
    }
};
