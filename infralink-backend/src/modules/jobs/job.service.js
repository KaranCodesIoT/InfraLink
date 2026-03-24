import Job from './job.model.js';
import { getPagination, buildPaginationMeta } from '../../utils/pagination.utils.js';
import { withCache, Keys, TTL, invalidateJobSearchCache } from '../../cache/cache.service.js';
import { emitJobCreated, emitJobUpdated, emitJobDeleted } from '../../events/job.events.js';
import User from '../users/user.model.js';
import ContractorProfile from '../contractors/contractorProfile.model.js';

export const createJob = async (clientId, data) => {
    const job = await Job.create({ ...data, client: clientId });
    await invalidateJobSearchCache();
    emitJobCreated(job);
    return job;
};

export const getJobById = async (id) => {
    const job = await Job.findById(id).populate('client', 'name email avatar role phone').populate('assignedWorker', 'name avatar');
    if (!job) { const e = new Error('Job not found'); e.statusCode = 404; throw e; }
    return job;
};

export const listJobs = async (query) => {
    const { page, limit, skip, sort } = getPagination(query);
    const cacheKey = Keys.jobSearch({ ...query, page, limit });

    return withCache(cacheKey, async () => {
        const filter = {};
        if (query.status) filter.status = query.status;
        if (query.category) filter.category = query.category;
        if (query.skills) filter.requiredSkills = { $in: query.skills.split(',').map(s => s.trim()) };
        if (query.city) filter['location.city'] = new RegExp(query.city, 'i');
        if (query.state) filter['location.state'] = new RegExp(query.state, 'i');

        // Budget range filter
        if (query.budgetMin || query.budgetMax) {
            if (query.budgetMin) filter['budget.max'] = { ...filter['budget.max'], $gte: Number(query.budgetMin) };
            if (query.budgetMax) filter['budget.min'] = { ...filter['budget.min'], $lte: Number(query.budgetMax) };
        }

        // Keyword search
        if (query.search) {
            filter.$text = { $search: query.search };
        }

        const [jobs, total] = await Promise.all([
            Job.find(filter).populate('client', 'name avatar role phone').sort(sort).skip(skip).limit(limit),
            Job.countDocuments(filter),
        ]);
        return { jobs, pagination: buildPaginationMeta(total, page, limit) };
    }, TTL.JOB_SEARCH);
};

export const getMyJobs = async (userId, query) => {
    const { page, limit, skip, sort } = getPagination(query);
    const filter = { client: userId };
    if (query.status) filter.status = query.status;

    const [jobs, total] = await Promise.all([
        Job.find(filter).sort(sort).skip(skip).limit(limit),
        Job.countDocuments(filter),
    ]);
    return { jobs, pagination: buildPaginationMeta(total, page, limit) };
};

export const updateJob = async (id, clientId, data) => {
    const oldJob = await Job.findOne({ _id: id, client: clientId });
    if (!oldJob) { const e = new Error('Job not found or unauthorized'); e.statusCode = 404; throw e; }

    const job = await Job.findOneAndUpdate({ _id: id, client: clientId }, data, { new: true, runValidators: true });
    if (!job) { const e = new Error('Job not found or unauthorized'); e.statusCode = 404; throw e; }

    // Project tracking logic for contractors
    if (oldJob.status !== job.status && job.assignedWorker) {
        try {
            const worker = await User.findById(job.assignedWorker);
            if (worker && worker.role === 'contractor') {
                const contractorProfile = await ContractorProfile.findOne({ user: worker._id });
                if (contractorProfile) {
                    if (oldJob.status !== 'in_progress' && job.status === 'in_progress') {
                        contractorProfile.ongoingProjects = (contractorProfile.ongoingProjects || 0) + 1;
                    } else if (oldJob.status === 'in_progress' && job.status === 'completed') {
                        contractorProfile.ongoingProjects = Math.max(0, (contractorProfile.ongoingProjects || 0) - 1);
                        contractorProfile.completedProjects = (contractorProfile.completedProjects || 0) + 1;
                    } else if (oldJob.status === 'in_progress' && (job.status === 'cancelled' || job.status === 'open' || job.status === 'on_hold' || job.status === 'draft')) {
                        contractorProfile.ongoingProjects = Math.max(0, (contractorProfile.ongoingProjects || 0) - 1);
                    }
                    await contractorProfile.save();
                }
            }
        } catch (err) {
            console.error('[job.service] Error updating contractor project counts:', err);
        }
    }

    emitJobUpdated(job);
    return job;
};

export const deleteJob = async (id, clientId) => {
    const job = await Job.findOneAndDelete({ _id: id, client: clientId });
    if (!job) { const e = new Error('Job not found or unauthorized'); e.statusCode = 404; throw e; }
    emitJobDeleted(id);
};
