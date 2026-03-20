import * as directoryService from './directory.service.js';
import { sendSuccess, sendPaginatedSuccess, sendError } from '../../utils/response.utils.js';
import { HTTP_STATUS } from '../../constants/httpStatus.js';

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
        const professional = await directoryService.getProfessionalById(id, req.user._id);
        
        if (!professional) {
            return sendError(res, 'Professional not found', HTTP_STATUS.NOT_FOUND);
        }
        
        return sendSuccess(res, professional, 'Professional profile retrieved successfully');
    } catch (error) {
        next(error);
    }
};
