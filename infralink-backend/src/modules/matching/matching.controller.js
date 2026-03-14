import * as matchingService from './matching.service.js';
import jobService from '../jobs/job.service.js';
import { sendSuccess, sendPaginatedSuccess } from '../../utils/response.utils.js';

export const triggerMatching = async (req, res, next) => {
    try {
        const job = await jobService.getJobById(req.params.jobId);
        const result = await matchingService.triggerAiMatching(job);
        sendSuccess(res, result, 'AI matching triggered');
    } catch (e) { next(e); }
};

export const getMatchesForJob = async (req, res, next) => {
    try {
        const { matches, pagination } = await matchingService.getMatchesForJob(req.params.jobId, req.query);
        sendPaginatedSuccess(res, matches, pagination);
    } catch (e) { next(e); }
};
