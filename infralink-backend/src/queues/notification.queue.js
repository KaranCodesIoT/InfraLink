import Bull from 'bull';
import logger from '../utils/logger.js';

let _queue = null;

export const getNotificationQueue = () => {
    if (_queue) return _queue;
    if (!process.env.REDIS_URL) {
        logger.warn('REDIS_URL not set — notification queue disabled.');
        return null;
    }
    _queue = new Bull('notifications', {
        redis: process.env.REDIS_URL,
        defaultJobOptions: {
            attempts: 3,
            backoff: { type: 'fixed', delay: 2000 },
            removeOnComplete: true,
        },
    });
    _queue.on('error', (err) => logger.error(`Notification queue error: ${err.message}`));
    return _queue;
};

export const notificationQueue = null; // consumers should use getNotificationQueue()
export default getNotificationQueue;
