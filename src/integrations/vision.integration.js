/**
 * Vision integration — Gemini Vision or Google Cloud Vision API.
 * Gemini Vision is used by default (no extra install needed).
 */
import { getModel } from '../config/ai.js';
import { AI_MODELS } from '../constants/aiConstants.js';
import logger from '../utils/logger.js';

/**
 * Analyse an image buffer using Gemini Vision.
 * @param {Buffer} imageBuffer
 * @param {string} mimeType - e.g. 'image/jpeg'
 * @param {string} prompt - analysis instruction
 */
export const analyseImageWithGemini = async (imageBuffer, mimeType, prompt = 'Describe this construction site image in detail. Identify safety hazards, equipment, materials, and work progress.') => {
    try {
        const model = getModel(AI_MODELS.GEMINI_PRO_VISION);
        const result = await model.generateContent([
            prompt,
            { inlineData: { data: imageBuffer.toString('base64'), mimeType } },
        ]);
        return { analysis: result.response.text().trim(), model: AI_MODELS.GEMINI_PRO_VISION };
    } catch (error) {
        logger.error(`Gemini Vision error: ${error.message}`);
        throw error;
    }
};

/**
 * Extract labels/objects from image using Gemini.
 */
export const extractLabels = async (imageBuffer, mimeType) => {
    const prompt = 'List all objects, materials, equipment, and hazards visible in this image as a JSON array of strings.';
    const result = await analyseImageWithGemini(imageBuffer, mimeType, prompt);
    try {
        return JSON.parse(result.analysis);
    } catch {
        return result.analysis.split(',').map(s => s.trim());
    }
};

/**
 * Structural damage assessment for construction inspections.
 */
export const assessDamage = async (imageBuffer, mimeType) => {
    const prompt = 'Assess any visible structural damage, defects, or safety concerns in this construction image. Return JSON: { severity: "low|medium|high|critical", issues: [], recommendations: [] }';
    const result = await analyseImageWithGemini(imageBuffer, mimeType, prompt);
    try {
        return JSON.parse(result.analysis);
    } catch {
        return { severity: 'unknown', issues: [result.analysis], recommendations: [] };
    }
};
