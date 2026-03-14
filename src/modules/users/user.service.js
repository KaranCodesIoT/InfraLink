import User from './user.model.js';
import { getPagination, buildPaginationMeta } from '../../utils/pagination.utils.js';

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
    const user = await User.findByIdAndUpdate(id, data, { new: true, runValidators: true });
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
