import Bull from 'bull';
import logger from '../utils/logger.js';

let _queue = null;

export const getEscalationQueue = () => {
    if (_queue) return _queue;
    if (!process.env.REDIS_URL) {
        logger.warn('REDIS_URL not set — escalation queue disabled.');
        return null;
    }
    _queue = new Bull('escalation', process.env.REDIS_URL, {
        redis: { retryStrategy: () => null, maxRetriesPerRequest: null },
        defaultJobOptions: {
            attempts: 3,
            backoff: { type: 'exponential', delay: 5000 },
            removeOnComplete: 50,
            removeOnFail: 100,
        },
    });
    _queue.on('error', (err) => logger.error(`Escalation queue error: ${err.message}`));
    _queue.on('failed', (job, err) => logger.error(`Escalation job ${job.id} failed: ${err.message}`));
    return _queue;
};

// Keep named export for backwards compatibility
export const escalationQueue = null; // consumers should use getEscalationQueue()

export default getEscalationQueue;
