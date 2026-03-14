import * as workerService from './worker.service.js';
import { sendSuccess, sendPaginatedSuccess } from '../../utils/response.utils.js';

export const getMyProfile = async (req, res, next) => {
    try { sendSuccess(res, await workerService.getOrCreateProfile(req.user._id)); }
    catch (e) { next(e); }
};

export const updateProfile = async (req, res, next) => {
    try { sendSuccess(res, await workerService.updateProfile(req.user._id, req.body), 'Profile updated'); }
    catch (e) { next(e); }
};

export const listWorkers = async (req, res, next) => {
    try {
        const { workers, pagination } = await workerService.listWorkers(req.query);
        sendPaginatedSuccess(res, workers, pagination);
    } catch (e) { next(e); }
};
