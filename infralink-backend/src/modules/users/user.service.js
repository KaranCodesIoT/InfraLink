import User from './user.model.js';
import { getPagination, buildPaginationMeta } from '../../utils/pagination.utils.js';
import { cloudinary } from '../../config/cloudinary.js';

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
