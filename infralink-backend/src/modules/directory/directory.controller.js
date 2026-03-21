import * as directoryService from './directory.service.js';
import { sendSuccess, sendPaginatedSuccess, sendError } from '../../utils/response.utils.js';
import { HTTP_STATUS } from '../../constants/httpStatus.js';
import * as followService from '../network/services/follow.service.js';

export const getProfessionals = async (req, res, next) => {
    try {
        const { role, page = 1, limit = 10, search } = req.query;
        const { professionals, pagination } = await directoryService.findProfessionals({
            role,
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            search,
        });
        
        return sendPaginatedSuccess(res, professionals, pagination);
    } catch (error) {
        next(error);
    }
};

export const getDirectoryStats = async (req, res, next) => {
    try {
        const stats = await directoryService.getCountsByRole();
        return sendSuccess(res, stats, 'Directory stats retrieved successfully');
    } catch (error) {
        next(error);
    }
};


export const getProfessionalById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const currentUserId = req.user._id;
        const professional = await directoryService.getProfessionalById(id, currentUserId);
        
        if (!professional) {
            return sendError(res, 'Professional not found', HTTP_STATUS.NOT_FOUND);
        }

        // Check if the user part of the professional profile is private
        // Note: professional object often contains 'user' or flattened user fields
        const userRef = professional.user || professional;
        
        if (userRef.isPrivate && currentUserId.toString() !== userRef._id.toString() && req.user.role !== 'admin') {
            const followStatus = await followService.checkFollowStatus(currentUserId, req.user.role, userRef._id);
            
            if (followStatus.status !== 'accepted') {
                // Redact professional profile
                const restrictedProf = {
                    _id: professional._id,
                    name: userRef.name,
                    displayName: userRef.displayName || userRef.name,
                    avatar: userRef.avatar,
                    role: userRef.role,
                    isPrivate: true,
                    isRestricted: true,
                    followersCount: userRef.followersCount,
                    followingCount: userRef.followingCount,
                    // Minimal directory info allowed
                    location: professional.location,
                    category: professional.category
                };
                return sendSuccess(res, restrictedProf, 'Profile is private');
            }
        }
        
        return sendSuccess(res, professional, 'Professional profile retrieved successfully');
    } catch (error) {
        next(error);
    }
};
