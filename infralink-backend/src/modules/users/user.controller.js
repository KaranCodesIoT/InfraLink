import * as userService from './user.service.js';
import { sendSuccess, sendPaginatedSuccess } from '../../utils/response.utils.js';
import * as followService from '../network/services/follow.service.js';

export const getMe = async (req, res, next) => {
    try {
        const user = await userService.getUserById(req.user._id);
        sendSuccess(res, user);
    } catch (e) { next(e); }
};

export const getUserById = async (req, res, next) => {
    try {
        const targetId = req.params.id;
        const currentUserId = req.user._id;

        const user = await userService.getUserById(targetId);
        
        // If it's the user's own profile, return full
        if (currentUserId.toString() === targetId.toString() || req.user.role === 'admin') {
            return sendSuccess(res, user);
        }

        // Check privacy & follow status
        if (user.isPrivate) {
            const followStatus = await followService.checkFollowStatus(currentUserId, req.user.role, targetId);
            
            if (followStatus.status !== 'accepted') {
                // Return restricted profile
                const restrictedUser = {
                    _id: user._id,
                    name: user.name,
                    avatar: user.avatar,
                    role: user.role,
                    bio: user.bio,
                    isPrivate: true,
                    followersCount: user.followersCount,
                    followingCount: user.followingCount,
                    isRestricted: true // UI hint
                };
                return sendSuccess(res, restrictedUser, 'Profile is private');
            }
        }

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
        
        const authUserId = req.user._id.toString();
        const paramId = req.params.id.toString();
        
        // Ensure user is updating their own avatar (or admin)
        if (authUserId !== paramId && req.user.role !== 'admin') {
            console.log('[uploadAvatar] Auth mismatch:', { authUserId, paramId, role: req.user.role });
            return res.status(403).json({ status: 'error', message: 'Not authorized to update this profile' });
        }

        const user = await userService.uploadAvatar(paramId, req.file.buffer);
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
