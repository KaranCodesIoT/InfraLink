import { analyseImageWithGemini, extractLabels, assessDamage } from '../../../integrations/vision.integration.js';
import { resizeAndCompress, validateImageType } from '../../../utils/imageProcessor.utils.js';
import { VISION_DEFAULTS } from '../../../constants/aiConstants.js';

export const analyseImage = async (imageBuffer, mimeType, { prompt, mode = 'general' } = {}) => {
    if (!validateImageType(mimeType)) {
        const e = new Error(`Unsupported image type: ${mimeType}. Allowed: ${VISION_DEFAULTS.SUPPORTED_FORMATS.join(', ')}`);
        e.statusCode = 400;
        throw e;
    }

    // Resize before sending to Vision API
    const { buffer: optimisedBuffer, mimeType: outMimeType } = await resizeAndCompress(imageBuffer);

    switch (mode) {
        case 'labels':
            return { labels: await extractLabels(optimisedBuffer, outMimeType), mode };
        case 'damage':
            return { ...(await assessDamage(optimisedBuffer, outMimeType)), mode };
        case 'general':
        default:
            return await analyseImageWithGemini(optimisedBuffer, outMimeType, prompt);
    }
};
