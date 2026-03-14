/**
 * Job Socket Event Constants
 */
export const JOB_SOCKET_EVENTS = {
    // Client → Server
    SUBSCRIBE: 'job:subscribe',
    UNSUBSCRIBE: 'job:unsubscribe',

    // Server → Client
    UPDATED: 'job:updated',
    STATUS_CHANGED: 'job:statusChanged',
    WORKER_ASSIGNED: 'job:workerAssigned',
    NEW_APPLICATION: 'job:newApplication',
    MATCH_READY: 'job:matchReady',
};
