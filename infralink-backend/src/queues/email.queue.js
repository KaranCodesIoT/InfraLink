import Bull from 'bull';
import logger from '../utils/logger.js';

let _queue = null;

export const getEmailQueue = () => {
    if (_queue) return _queue;
    if (!process.env.REDIS_URL) {
        logger.warn('REDIS_URL not set — email queue disabled.');
        return null;
    }
    _queue = new Bull('emails', {
        redis: process.env.REDIS_URL,
        defaultJobOptions: {
            attempts: 5,
            backoff: { type: 'exponential', delay: 3000 },
            removeOnComplete: true,
        },
    });
    _queue.on('error', (err) => logger.error(`Email queue error: ${err.message}`));
    return _queue;
};

export const emailQueue = null; // consumers should use getEmailQueue()
export default getEmailQueue;
