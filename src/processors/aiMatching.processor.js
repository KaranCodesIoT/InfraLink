import { aiMatchingQueue } from '../queues/aiMatching.queue.js';
import { matchWorkersToJob } from '../integrations/gemini.service.js';
import Match from '../modules/matching/match.model.js';
import logger from '../utils/logger.js';

aiMatchingQueue.process(async (job) => {
    const { jobId, workers, jobData } = job.data;
    logger.info(`Processing AI matching for job: ${jobId}`);

    try {
        const rankings = await matchWorkersToJob(jobData, workers);

        const matchDocs = rankings.map((r) => ({
            job: jobId,
            worker: workers[r.workerIndex]?._id,
            aiScore: r.score,
            aiReasoning: r.reason,
            status: 'pending',
        }));

        await Match.insertMany(matchDocs, { ordered: false });
        logger.info(`AI matching complete for job: ${jobId}. ${matchDocs.length} matches created.`);
    } catch (error) {
        logger.error(`AI matching failed for job ${jobId}: ${error.message}`);
        throw error;
    }
});
