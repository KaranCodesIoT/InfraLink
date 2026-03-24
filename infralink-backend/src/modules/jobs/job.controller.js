import * as jobService from './job.service.js';
import { sendSuccess, sendCreated, sendPaginatedSuccess } from '../../utils/response.utils.js';

export const createJob = async (req, res, next) => {
    try { sendCreated(res, await jobService.createJob(req.user._id, req.body), 'Job created'); }
    catch (e) { next(e); }
};

export const getJobById = async (req, res, next) => {
    try { sendSuccess(res, await jobService.getJobById(req.params.id)); }
    catch (e) { next(e); }
};

export const listJobs = async (req, res, next) => {
    try {
        const { jobs, pagination } = await jobService.listJobs(req.query);
        sendPaginatedSuccess(res, jobs, pagination);
    } catch (e) { next(e); }
};

export const getMyJobs = async (req, res, next) => {
    try {
        const { jobs, pagination } = await jobService.getMyJobs(req.user._id, req.query);
        sendPaginatedSuccess(res, jobs, pagination);
    } catch (e) { next(e); }
};

export const updateJob = async (req, res, next) => {
    try { sendSuccess(res, await jobService.updateJob(req.params.id, req.user._id, req.body), 'Job updated'); }
    catch (e) { next(e); }
};

export const deleteJob = async (req, res, next) => {
    try { await jobService.deleteJob(req.params.id, req.user._id); sendSuccess(res, null, 'Job deleted'); }
    catch (e) { next(e); }
};
