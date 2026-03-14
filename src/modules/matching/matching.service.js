import Match from './match.model.js';
import WorkerProfile from '../workers/workerProfile.model.js';
import { aiMatchingQueue } from '../../queues/aiMatching.queue.js';
import { computeMatchScore } from '../../utils/scoring.utils.js';
import { getPagination, buildPaginationMeta } from '../../utils/pagination.utils.js';

export const triggerAiMatching = async (job) => {
    const workers = await WorkerProfile.find({
        skills: { $in: job.requiredSkills },
        isAvailable: true,
    }).populate('user', 'name').limit(50);

    if (!workers.length) return { queued: false, reason: 'No matching workers found' };

    // Compute quick scores for pre-filtering
    const scored = workers
        .map((w) => ({ ...w.toObject(), preScore: computeMatchScore(w, job) }))
        .sort((a, b) => b.preScore - a.preScore)
        .slice(0, 20);

    await aiMatchingQueue.add({ jobId: job._id, workers: scored, jobData: job });
    return { queued: true, workerCount: scored.length };
};

export const getMatchesForJob = async (jobId, query) => {
    const { page, limit, skip, sort } = getPagination(query);
    const filter = { job: jobId };
    const [matches, total] = await Promise.all([
        Match.find(filter).populate('worker', 'name avatar').sort(sort || '-aiScore').skip(skip).limit(limit),
        Match.countDocuments(filter),
    ]);
    return { matches, pagination: buildPaginationMeta(total, page, limit) };
};
