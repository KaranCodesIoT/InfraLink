/**
 * Job Domain Events
 *
 * Emitted by the job service and consumed by matching, notifications, etc.
 * Import JOB_EVENTS for the event name constants.
 */
import eventBus from './eventBus.js';
import logger from '../utils/logger.js';

export const JOB_EVENTS = {
    CREATED: 'job:created',
    UPDATED: 'job:updated',
    DELETED: 'job:deleted',
    STATUS_CHANGED: 'job:statusChanged',
    WORKER_ASSIGNED: 'job:workerAssigned',
};

// ─── Register listeners ───────────────────────────────────────────────────────

eventBus.on(JOB_EVENTS.CREATED, async (job) => {
    logger.info(`[Event] ${JOB_EVENTS.CREATED} — jobId: ${job._id}`);

    // Dynamically import to avoid circular deps
    const { triggerAiMatching } = await import('../modules/matching/matching.service.js');
    try {
        await triggerAiMatching(job);
        logger.info(`[Event] AI matching triggered for job ${job._id}`);
    } catch (err) {
        logger.error(`[Event] AI matching trigger failed: ${err.message}`);
    }
});

eventBus.on(JOB_EVENTS.UPDATED, async ({ job }) => {
    logger.info(`[Event] ${JOB_EVENTS.UPDATED} — jobId: ${job._id}`);
    // Invalidate cached job search results
    const { invalidateJobSearchCache } = await import('../cache/cache.service.js');
    await invalidateJobSearchCache();
});

eventBus.on(JOB_EVENTS.DELETED, async ({ jobId }) => {
    logger.info(`[Event] ${JOB_EVENTS.DELETED} — jobId: ${jobId}`);
    const { invalidateJobSearchCache, invalidateAiMatchCache } = await import('../cache/cache.service.js');
    await invalidateJobSearchCache();
    await invalidateAiMatchCache(jobId);
});

eventBus.on(JOB_EVENTS.WORKER_ASSIGNED, async ({ job, worker }) => {
    logger.info(`[Event] ${JOB_EVENTS.WORKER_ASSIGNED} — jobId: ${job._id}, workerId: ${worker._id}`);
    // Emit a notification event
    eventBus.emit('notification:send', {
        userId: worker._id,
        title: 'You have been assigned to a job!',
        body: `You were hired for "${job.title}".`,
        type: 'job_match',
        metadata: { jobId: job._id },
    });
});

// ─── Emit helpers (call these from services) ──────────────────────────────────

export const emitJobCreated = (job) => eventBus.emit(JOB_EVENTS.CREATED, job);
export const emitJobUpdated = (job) => eventBus.emit(JOB_EVENTS.UPDATED, { job });
export const emitJobDeleted = (jobId) => eventBus.emit(JOB_EVENTS.DELETED, { jobId });
export const emitJobStatusChanged = (job, oldStatus) => eventBus.emit(JOB_EVENTS.STATUS_CHANGED, { job, oldStatus });
export const emitWorkerAssigned = (job, worker) => eventBus.emit(JOB_EVENTS.WORKER_ASSIGNED, { job, worker });
