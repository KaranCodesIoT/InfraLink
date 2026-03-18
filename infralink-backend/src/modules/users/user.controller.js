import * as userService from './user.service.js';
import { sendSuccess, sendPaginatedSuccess } from '../../utils/response.utils.js';

export const getMe = async (req, res, next) => {
    try {
        const user = await userService.getUserById(req.user._id);
        sendSuccess(res, user);
    } catch (e) { next(e); }
};

export const getUserById = async (req, res, next) => {
    try {
        const user = await userService.getUserById(req.params.id);
        sendSuccess(res, user);
    } catch (e) { next(e); }
};

export const updateUser = async (req, res, next) => {
    try {
        const user = await userService.updateUser(req.params.id, req.body);
        sendSuccess(res, user, 'User updated');
    } catch (e) { next(e); }
};

export const uploadAvatar = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ status: 'error', message: 'No image provided' });
        }
        
        // Ensure user is updating their own avatar (or admin)
        if (req.user._id.toString() !== req.params.id && req.user.role !== 'admin') {
            return res.status(403).json({ status: 'error', message: 'Not authorized to update this profile' });
        }

        const user = await userService.uploadAvatar(req.params.id, req.file.buffer);
        sendSuccess(res, user, 'Avatar updated successfully');
    } catch (e) { next(e); }
};

export const getAllUsers = async (req, res, next) => {
    try {
        const { users, pagination } = await userService.getAllUsers(req.query);
        sendPaginatedSuccess(res, users, pagination);
    } catch (e) { next(e); }
};

export const deleteUser = async (req, res, next) => {
    try {
        await userService.deleteUser(req.params.id);
        sendSuccess(res, null, 'User deactivated');
    } catch (e) { next(e); }
};
