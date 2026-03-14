import Job from './job.model.js';
import { getPagination, buildPaginationMeta } from '../../utils/pagination.utils.js';
import { withCache, Keys, TTL, invalidateJobSearchCache } from '../../cache/cache.service.js';
import { emitJobCreated, emitJobUpdated, emitJobDeleted } from '../../events/job.events.js';

export const createJob = async (clientId, data) => {
    const job = await Job.create({ ...data, client: clientId });
    await invalidateJobSearchCache();
    emitJobCreated(job); // triggers AI matching + cache busting via event
    return job;
};

export const getJobById = async (id) => {
    const job = await Job.findById(id).populate('client', 'name email avatar').populate('assignedWorker', 'name avatar');
    if (!job) { const e = new Error('Job not found'); e.statusCode = 404; throw e; }
    return job;
};

export const listJobs = async (query) => {
    const { page, limit, skip, sort } = getPagination(query);
    const cacheKey = Keys.jobSearch({ ...query, page, limit });

    return withCache(cacheKey, async () => {
        const filter = {};
        if (query.status) filter.status = query.status;
        if (query.skills) filter.requiredSkills = { $in: query.skills.split(',').map(s => s.trim()) };
        if (query.city) filter['location.city'] = new RegExp(query.city, 'i');
        const [jobs, total] = await Promise.all([
            Job.find(filter).populate('client', 'name avatar').sort(sort).skip(skip).limit(limit),
            Job.countDocuments(filter),
        ]);
        return { jobs, pagination: buildPaginationMeta(total, page, limit) };
    }, TTL.JOB_SEARCH);
};

export const updateJob = async (id, clientId, data) => {
    const job = await Job.findOneAndUpdate({ _id: id, client: clientId }, data, { new: true, runValidators: true });
    if (!job) { const e = new Error('Job not found or unauthorized'); e.statusCode = 404; throw e; }
    emitJobUpdated(job);
    return job;
};

export const deleteJob = async (id, clientId) => {
    const job = await Job.findOneAndDelete({ _id: id, client: clientId });
    if (!job) { const e = new Error('Job not found or unauthorized'); e.statusCode = 404; throw e; }
    emitJobDeleted(id);
};
