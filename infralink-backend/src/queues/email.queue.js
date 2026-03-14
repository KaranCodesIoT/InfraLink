import Bull from 'bull';

export const emailQueue = new Bull('emails', {
    redis: process.env.REDIS_URL,
    defaultJobOptions: {
        attempts: 5,
        backoff: { type: 'exponential', delay: 3000 },
        removeOnComplete: true,
    },
});
