import User from './user.model.js';
import { getPagination, buildPaginationMeta } from '../../utils/pagination.utils.js';
import { cloudinary } from '../../config/cloudinary.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = path.resolve(__dirname, '..', '..', '..', 'public', 'uploads', 'avatars');
const RESUME_DIR = path.resolve(__dirname, '..', '..', '..', 'public', 'uploads', 'resumes');

// Ensure upload dir exists
if (!fs.existsSync(PUBLIC_DIR)) {
    fs.mkdirSync(PUBLIC_DIR, { recursive: true });
}
if (!fs.existsSync(RESUME_DIR)) {
    fs.mkdirSync(RESUME_DIR, { recursive: true });
}

const isCloudinaryConfigured = () => {
    const name = process.env.CLOUDINARY_CLOUD_NAME;
    return name && name !== 'your_cloud_name' && name.length > 3;
};

export const getUserById = async (id) => {
    const user = await User.findById(id);
    if (!user) {
        const err = new Error('User not found');
        err.statusCode = 404;
        throw err;
    }
    return user;
};

export const updateUser = async (id, data) => {
    if (data.location) {
        data.location.type = data.location.type || 'Point';
        data.location.coordinates = data.location.coordinates || [0, 0];
    }
    const user = await User.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!user) {
        const err = new Error('User not found');
        err.statusCode = 404;
        throw err;
    }
    return user;
};

export const uploadAvatar = async (id, imageBuffer) => {
    if (isCloudinaryConfigured()) {
        // Use Cloudinary
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { 
                    folder: 'infralink/avatars',
                    transformation: [{ width: 500, height: 500, crop: 'fill' }] 
                },
                async (error, result) => {
                    if (error) return reject(error);
                    try {
                        const user = await User.findByIdAndUpdate(
                            id,
                            { avatar: result.secure_url },
                            { new: true, runValidators: true }
                        );
                        if (!user) {
                            const err = new Error('User not found');
                            err.statusCode = 404;
                            throw err;
                        }
                        resolve(user);
                    } catch (dbError) {
                        reject(dbError);
                    }
                }
            );
            uploadStream.end(imageBuffer);
        });
    }

    // Local disk fallback
    const filename = `${id}_${Date.now()}.jpg`;
    const filePath = path.join(PUBLIC_DIR, filename);
    fs.writeFileSync(filePath, imageBuffer);

    const port = process.env.PORT || 5000;
    const avatarUrl = `http://localhost:${port}/uploads/avatars/${filename}`;
    const user = await User.findByIdAndUpdate(
        id,
        { avatar: avatarUrl },
        { new: true, runValidators: true }
    );
    if (!user) {
        const err = new Error('User not found');
        err.statusCode = 404;
        throw err;
    }
    return user;
};

export const getAllUsers = async (query) => {
    const { page, limit, skip, sort } = getPagination(query);
    const [users, total] = await Promise.all([
        User.find({ isActive: true }).sort(sort).skip(skip).limit(limit),
        User.countDocuments({ isActive: true }),
    ]);
    return { users, pagination: buildPaginationMeta(total, page, limit) };
};

export const deleteUser = async (id) => {
    await User.findByIdAndUpdate(id, { isActive: false });
};

export const uploadResume = async (id, fileBuffer, originalName) => {
    const ext = path.extname(originalName) || '.pdf';
    
    if (isCloudinaryConfigured()) {
        // Use Cloudinary
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { 
                    folder: 'infralink/resumes',
                    resource_type: 'auto'
                },
                async (error, result) => {
                    if (error) return reject(error);
                    try {
                        const user = await User.findByIdAndUpdate(
                            id,
                            { resume: result.secure_url },
                            { new: true, runValidators: true }
                        );
                        if (!user) {
                            const err = new Error('User not found');
                            err.statusCode = 404;
                            throw err;
                        }
                        resolve(user);
                    } catch (dbError) {
                        reject(dbError);
                    }
                }
            );
            uploadStream.end(fileBuffer);
        });
    }

    // Local disk fallback
    const filename = `${id}_${Date.now()}${ext}`;
    const filePath = path.join(RESUME_DIR, filename);
    fs.writeFileSync(filePath, fileBuffer);

    const port = process.env.PORT || 5000;
    const resumeUrl = `http://localhost:${port}/uploads/resumes/${filename}`;
    const user = await User.findByIdAndUpdate(
        id,
        { resume: resumeUrl },
        { new: true, runValidators: true }
    );
    if (!user) {
        const err = new Error('User not found');
        err.statusCode = 404;
        throw err;
    }
    return user;
};
