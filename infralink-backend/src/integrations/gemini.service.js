import { getModel } from '../config/ai.js';
import { buildMatchPrompt } from '../utils/aiPrompt.utils.js';
import logger from '../utils/logger.js';

export const matchWorkersToJob = async (job, workers) => {
    try {
        const model = getModel('gemini-pro');
        const prompt = buildMatchPrompt(job, workers);
        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();
        return JSON.parse(text);
    } catch (error) {
        logger.error(`Gemini matching error: ${error.message}`);
        throw error;
    }
};

export const generateJobDescription = async (partialJob) => {
    const model = getModel('gemini-pro');
    const prompt = `Generate a professional job description for: ${JSON.stringify(partialJob)}`;
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
};
