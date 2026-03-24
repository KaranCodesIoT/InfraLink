import * as appService from './application.service.js';
import { sendSuccess, sendCreated, sendPaginatedSuccess } from '../../utils/response.utils.js';

export const apply = async (req, res, next) => {
    try { sendCreated(res, await appService.apply(req.user._id, req.body), 'Application submitted'); }
    catch (e) { next(e); }
};

export const listApplicationsForJob = async (req, res, next) => {
    try {
        const { applications, pagination } = await appService.listApplicationsForJob(req.params.jobId, req.query);
        sendPaginatedSuccess(res, applications, pagination);
    } catch (e) { next(e); }
};

export const getMyApplications = async (req, res, next) => {
    try {
        const { applications, pagination } = await appService.getMyApplications(req.user._id, req.query);
        sendPaginatedSuccess(res, applications, pagination);
    } catch (e) { next(e); }
};

export const updateApplicationStatus = async (req, res, next) => {
    try { sendSuccess(res, await appService.updateApplicationStatus(req.params.id, req.body), 'Application updated'); }
    catch (e) { next(e); }
};
