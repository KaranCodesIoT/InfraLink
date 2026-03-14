/**
 * Image processing utilities.
 * Resize/compress images before sending to Vision APIs to reduce cost and latency.
 * Install: npm install sharp
 */
import logger from './logger.js';
import { VISION_DEFAULTS } from '../constants/aiConstants.js';

/**
 * Checks if the image exceeds the size limit.
 */
export const isImageTooLarge = (buffer) => {
    return buffer.length > VISION_DEFAULTS.MAX_IMAGE_SIZE_MB * 1024 * 1024;
};

/**
 * Resize and compress image buffer using sharp.
 * Falls back to original buffer if sharp is not installed.
 *
 * @param {Buffer} imageBuffer
 * @param {{ maxWidth?: number, maxHeight?: number, quality?: number }} options
 * @returns {Promise<{ buffer: Buffer, mimeType: string }>}
 */
export const resizeAndCompress = async (imageBuffer, { maxWidth = 1024, maxHeight = 1024, quality = 80 } = {}) => {
    try {
        const sharp = (await import('sharp')).default;
        const compressed = await sharp(imageBuffer)
            .resize(maxWidth, maxHeight, { fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality })
            .toBuffer();
        return { buffer: compressed, mimeType: 'image/jpeg' };
    } catch {
        logger.warn('sharp not available — using original image buffer. Install sharp for image optimisation.');
        return { buffer: imageBuffer, mimeType: 'image/jpeg' };
    }
};

/**
 * Extract base64 data URI string from a buffer.
 */
export const toBase64DataUri = (buffer, mimeType) => {
    return `data:${mimeType};base64,${buffer.toString('base64')}`;
};

/**
 * Validate image MIME type against allowed list.
 */
export const validateImageType = (mimeType) => {
    return VISION_DEFAULTS.SUPPORTED_FORMATS.includes(mimeType);
};
