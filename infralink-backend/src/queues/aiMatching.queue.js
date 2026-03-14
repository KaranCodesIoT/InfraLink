import Bull from 'bull';

export const aiMatchingQueue = new Bull('ai-matching', {
    redis: process.env.REDIS_URL,
    defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: true,
        removeOnFail: false,
    },
});
