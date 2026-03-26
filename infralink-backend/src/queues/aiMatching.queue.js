import Bull from 'bull';
import logger from '../utils/logger.js';

let _queue = null;

export const getAiMatchingQueue = () => {
    if (_queue) return _queue;
    if (!process.env.REDIS_URL) {
        logger.warn('REDIS_URL not set — AI matching queue disabled.');
        return null;
    }
    _queue = new Bull('ai-matching', {
        redis: process.env.REDIS_URL,
        defaultJobOptions: {
            attempts: 3,
            backoff: { type: 'exponential', delay: 5000 },
            removeOnComplete: true,
            removeOnFail: false,
        },
    });
    _queue.on('error', (err) => logger.error(`AI matching queue error: ${err.message}`));
    return _queue;
};

export const aiMatchingQueue = null; // consumers should use getAiMatchingQueue()
export default getAiMatchingQueue;
