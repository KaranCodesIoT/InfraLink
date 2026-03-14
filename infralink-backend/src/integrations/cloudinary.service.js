import { cloudinary } from '../config/cloudinary.js';
import logger from '../utils/logger.js';

/**
 * Upload a buffer to Cloudinary.
 * @param {Buffer} buffer
 * @param {object} options - folder, resource_type, etc.
 * @returns {Promise<{url: string, publicId: string}>}
 */
export const uploadBuffer = (buffer, options = {}) => {
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
