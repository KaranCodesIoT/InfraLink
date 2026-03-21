import { sendSuccess } from '../../utils/response.utils.js';
import { uploadBuffer } from '../../integrations/cloudinary.service.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const handleUpload = async (req, res, next) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, error: { message: 'No files provided for upload' } });
        }

        const uploadPromises = req.files.map(async (file) => {
            try {
                // Try Cloudinary first
                const result = await uploadBuffer(file.buffer, {
                    folder: 'infralink/uploads',
                    resource_type: 'auto',
                });
                return result.url;
            } catch (err) {
                console.error("Cloudinary failed, attempting local disk fallback for:", file.originalname, err);
                try {
                    // Fallback to local disk if Cloudinary fails (e.g., bad API key)
                    const uploadDir = path.join(__dirname, '..', '..', '..', 'public', 'uploads', 'media');
                    if (!fs.existsSync(uploadDir)) {
                        fs.mkdirSync(uploadDir, { recursive: true });
                    }
                    const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname || '')}`;
                    const filePath = path.join(uploadDir, filename);
                    fs.writeFileSync(filePath, file.buffer);
                    
                    const port = process.env.PORT || 5000;
                    return `http://localhost:${port}/uploads/media/${filename}`;
                } catch (fallbackError) {
                    console.error("Local disk fallback failed:", fallbackError);
                    throw fallbackError;
                }
            }
        });

        const urls = await Promise.all(uploadPromises);

        return sendSuccess(res, { urls }, 'Files uploaded successfully');
    } catch (error) {
        console.error("handleUpload global catch error:", error);
        next(error);
    }
};
