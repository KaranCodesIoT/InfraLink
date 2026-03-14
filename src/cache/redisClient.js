import { getRedisClient } from '../config/redis.js';
import logger from '../utils/logger.js';

/**
 * A thin wrapper around the Redis client that provides
 * typed get/set/del helpers with automatic JSON serialisation.
 */

export const cacheGet = async (key) => {
    try {
        const value = await getRedisClient().get(key);
        return value ? JSON.parse(value) : null;
    } catch (error) {
        logger.warn(`Cache GET failed for key "${key}": ${error.message}`);
        return null;
    }
};

export const cacheSet = async (key, value, ttlSeconds = 300) => {
    try {
        await getRedisClient().set(key, JSON.stringify(value), { EX: ttlSeconds });
    } catch (error) {
        logger.warn(`Cache SET failed for key "${key}": ${error.message}`);
    }
};

export const cacheDel = async (...keys) => {
    try {
        if (keys.length) await getRedisClient().del(keys);
    } catch (error) {
        logger.warn(`Cache DEL failed for keys [${keys.join(', ')}]: ${error.message}`);
    }
};

export const cacheExists = async (key) => {
    try {
        return (await getRedisClient().exists(key)) === 1;
    } catch {
        return false;
    }
};

export const cacheFlushByPattern = async (pattern) => {
    try {
        const client = getRedisClient();
        const keys = await client.keys(pattern);
        if (keys.length) await client.del(keys);
        logger.info(`Cache flushed ${keys.length} keys matching "${pattern}"`);
    } catch (error) {
        logger.warn(`Cache flush failed for pattern "${pattern}": ${error.message}`);
    }
};
