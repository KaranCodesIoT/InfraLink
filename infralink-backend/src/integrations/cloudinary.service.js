import { cloudinary } from '../config/cloudinary.js';
import logger from '../utils/logger.js';

/**
 * Upload a buffer to Cloudinary.
 * @param {Buffer} buffer
 * @param {object} options - folder, resource_type, etc.
 * @returns {Promise<{url: string, publicId: string}>}
 */
export const uploadBuffer = (buffer, options = {}) => {
    // DEVELOPMENT MOCK: If API keys are placeholders, return a high-quality construction image
    if (process.env.CLOUDINARY_API_KEY === 'your_api_key' || !process.env.CLOUDINARY_API_KEY) {
        const fallbacks = [
            'https://images.unsplash.com/photo-1541888946425-d81bb19480c5?q=80&w=2070&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1504307651254-35680f3344d7?q=80&w=2070&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1531834685032-c34bf0d84c77?q=80&w=2070&auto=format&fit=crop'
        ];
        const randomImage = fallbacks[Math.floor(Math.random() * fallbacks.length)];
        logger.warn(`Cloudinary: Using placeholder fallback for image (${randomImage}) because API key is missing or invalid.`);
        return Promise.resolve({ url: randomImage, publicId: 'mock_id' });
    }

    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { folder: 'infralink', ...options },
            (error, result) => {
                if (error) {
                    logger.error(`Cloudinary upload error: ${error.message}`);
                    return reject(error);
                }
                resolve({ url: result.secure_url, publicId: result.public_id });
            }
        );
        uploadStream.end(buffer);
    });
};

export const deleteFile = async (publicId) => {
    return cloudinary.uploader.destroy(publicId);
};
