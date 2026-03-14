import { cacheGet, cacheSet, cacheDel, cacheFlushByPattern } from './redisClient.js';

// ─── TTL constants (seconds) ─────────────────────────────────────────────────
export const TTL = {
    JOB_SEARCH: 60,        // 1 minute — job listings change frequently
    WORKER_LIST: 120,      // 2 minutes
    AI_MATCH: 600,         // 10 minutes — AI results are expensive
    NOTIFICATION_COUNT: 30,
    PROFILE: 300,          // 5 minutes
};

// ─── Key builders ─────────────────────────────────────────────────────────────
export const Keys = {
    jobSearch: (params) => `jobs:search:${JSON.stringify(params)}`,
    workerList: (params) => `workers:list:${JSON.stringify(params)}`,
    aiMatch: (jobId) => `ai:match:${jobId}`,
    userProfile: (userId) => `user:profile:${userId}`,
    notificationCount: (userId) => `notif:unread:${userId}`,
};

// ─── High-level cache helpers ─────────────────────────────────────────────────

/**
 * Cache-aside pattern helper.
 * Returns cached value if present; otherwise calls `fetchFn`, caches result, and returns it.
 *
 * @param {string} key
 * @param {() => Promise<*>} fetchFn
 * @param {number} ttl
 */
export const withCache = async (key, fetchFn, ttl = 300) => {
    const cached = await cacheGet(key);
    if (cached !== null) return cached;
    const fresh = await fetchFn();
    await cacheSet(key, fresh, ttl);
    return fresh;
};

// ─── Domain-specific invalidation ─────────────────────────────────────────────

export const invalidateJobSearchCache = () => cacheFlushByPattern('jobs:search:*');
export const invalidateWorkerCache = () => cacheFlushByPattern('workers:list:*');
export const invalidateAiMatchCache = (jobId) => cacheDel(Keys.aiMatch(jobId));
export const invalidateUserProfile = (userId) => cacheDel(Keys.userProfile(userId));
