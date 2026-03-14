import Bull from 'bull';
import logger from '../utils/logger.js';

export const escalationQueue = new Bull('escalation', {
    redis: process.env.REDIS_URL || 'redis://localhost:6379',
    defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: 50,
        removeOnFail: 100,
    },
});

escalationQueue.on('error', (err) => logger.error(`Escalation queue error: ${err.message}`));
escalationQueue.on('failed', (job, err) => logger.error(`Escalation job ${job.id} failed: ${err.message}`));

export default escalationQueue;
