import Application from './application.model.js';
import Job from '../jobs/job.model.js';
import { getPagination, buildPaginationMeta } from '../../utils/pagination.utils.js';

export const apply = async (workerId, { job: jobId, coverLetter, proposedRate }) => {
    const job = await Job.findById(jobId);
    if (!job || job.status !== 'open') { const e = new Error('Job not available'); e.statusCode = 400; throw e; }
    const application = await Application.create({ job: jobId, worker: workerId, coverLetter, proposedRate });
    await Job.findByIdAndUpdate(jobId, { $inc: { applicationsCount: 1 } });
    return application;
};

export const listApplicationsForJob = async (jobId, query) => {
    const { page, limit, skip, sort } = getPagination(query);
    const [applications, total] = await Promise.all([
        Application.find({ job: jobId }).populate('worker', 'name avatar role phone').sort(sort).skip(skip).limit(limit),
        Application.countDocuments({ job: jobId }),
    ]);
    return { applications, pagination: buildPaginationMeta(total, page, limit) };
};

export const updateApplicationStatus = async (id, data) => {
    return Application.findByIdAndUpdate(id, data, { new: true });
};
