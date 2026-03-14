/**
 * Match Domain Events
 * Emitted after AI matching completes; consumed by notification + socket layers.
 */
import eventBus from './eventBus.js';
import logger from '../utils/logger.js';

export const MATCH_EVENTS = {
    COMPLETED: 'match:completed',
    ACCEPTED: 'match:accepted',
    REJECTED: 'match:rejected',
};

eventBus.on(MATCH_EVENTS.COMPLETED, async ({ jobId, matches }) => {
    logger.info(`[Event] ${MATCH_EVENTS.COMPLETED} — jobId: ${jobId}, matches: ${matches.length}`);

    // Cache the results
    const { cacheSet, Keys, TTL } = await import('../cache/cache.service.js');
    await cacheSet(Keys.aiMatch(jobId), matches, TTL.AI_MATCH);

    // Notify each matched worker
    for (const match of matches.slice(0, 5)) {
        eventBus.emit('notification:send', {
            userId: match.worker,
            title: 'New job match found!',
            body: `You matched a new job with a score of ${match.aiScore}/100.`,
            type: 'job_match',
            metadata: { jobId, score: match.aiScore },
        });
    }
});

eventBus.on(MATCH_EVENTS.ACCEPTED, ({ match }) => {
    logger.info(`[Event] ${MATCH_EVENTS.ACCEPTED} — matchId: ${match._id}`);
});

eventBus.on(MATCH_EVENTS.REJECTED, ({ match }) => {
    logger.info(`[Event] ${MATCH_EVENTS.REJECTED} — matchId: ${match._id}`);
});

export const emitMatchCompleted = (jobId, matches) => eventBus.emit(MATCH_EVENTS.COMPLETED, { jobId, matches });
export const emitMatchAccepted = (match) => eventBus.emit(MATCH_EVENTS.ACCEPTED, { match });
export const emitMatchRejected = (match) => eventBus.emit(MATCH_EVENTS.REJECTED, { match });
