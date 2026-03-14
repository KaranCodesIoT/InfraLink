import Bull from 'bull';

export const notificationQueue = new Bull('notifications', {
    redis: process.env.REDIS_URL,
    defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'fixed', delay: 2000 },
        removeOnComplete: true,
    },
});
