import { createClient } from 'redis';
import logger from '../utils/logger.js';

let redisClient = null;
let _redisAvailable = false;

const connectRedis = async () => {
    if (!process.env.REDIS_URL) {
        logger.warn('REDIS_URL not set — Redis disabled. Queue/cache features will be skipped.');
        return null;
    }

    try {
        redisClient = createClient({ 
            url: process.env.REDIS_URL,
            socket: { reconnectStrategy: false }
        });
        redisClient.on('error', (err) => logger.warn(`Redis error: ${err.message}`));
        redisClient.on('connect', () => {
            logger.info('Redis connected');
            _redisAvailable = true;
        });
        await redisClient.connect();
        _redisAvailable = true;
        return redisClient;
    } catch (err) {
        logger.warn(`Redis unavailable (${err.message}) — continuing without cache/queue.`);
        redisClient = null;
        _redisAvailable = false;
        return null;
    }
};

export const getRedisClient = () => redisClient;
export const isRedisAvailable = () => _redisAvailable;

export default connectRedis;
