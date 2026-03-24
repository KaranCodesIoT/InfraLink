import Application from './application.model.js';
import Job from '../jobs/job.model.js';
import { getPagination, buildPaginationMeta } from '../../utils/pagination.utils.js';
import { createNotification } from '../notifications/notification.service.js';

export const apply = async (workerId, data) => {
    const { job: jobId, message, coverLetter, proposedRate, contactDetails } = data;

    // Fetch job and validate it exists and is open
    const job = await Job.findById(jobId).populate('client', 'name');
    if (!job || job.status !== 'open') {
        const e = new Error('Job not available or already closed');
        e.statusCode = 400;
        throw e;
    }

    // Prevent user from applying to their own job
    if (job.client._id.toString() === workerId.toString()) {
        const e = new Error('You cannot apply to your own job posting');
        e.statusCode = 403;
        throw e;
    }

    const application = await Application.create({
        job: jobId,
        worker: workerId,
        message,
        coverLetter,
        proposedRate,
        contactDetails,
    });

    // Update applications count
    await Job.findByIdAndUpdate(jobId, { $inc: { applicationsCount: 1 } });

    // Notify the job poster
    await createNotification(job.client._id, {
        title: 'New Application Received',
        body: `Someone applied to your job: "${job.title}"`,
        type: 'new_application',
        metadata: { jobId: job._id, applicationId: application._id },
    });

    return application;
};

export const listApplicationsForJob = async (jobId, query) => {
    const { page, limit, skip, sort } = getPagination(query);
    const [applications, total] = await Promise.all([
        Application.find({ job: jobId })
            .populate('worker', 'name avatar role phone email')
            .sort(sort)
            .skip(skip)
            .limit(limit),
        Application.countDocuments({ job: jobId }),
    ]);
    return { applications, pagination: buildPaginationMeta(total, page, limit) };
};

export const getMyApplications = async (userId, query) => {
    const { page, limit, skip } = getPagination(query);
    const filter = { worker: userId };
    if (query.status) filter.status = query.status;

    const [applications, total] = await Promise.all([
        Application.find(filter)
            .populate('job', 'title category location deadline status applicationsCount client')
            .populate({ path: 'job', populate: { path: 'client', select: 'name avatar role' } })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        Application.countDocuments(filter),
    ]);
    return { applications, pagination: buildPaginationMeta(total, page, limit) };
};

export const updateApplicationStatus = async (id, data) => {
    return Application.findByIdAndUpdate(id, data, { new: true });
};
