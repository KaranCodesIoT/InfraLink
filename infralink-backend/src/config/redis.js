import { createClient } from 'redis';
import logger from '../utils/logger.js';

let redisClient;

const connectRedis = async () => {
    redisClient = createClient({ url: process.env.REDIS_URL });

    redisClient.on('error', (err) => logger.error(`Redis error: ${err.message}`));
    redisClient.on('connect', () => logger.info('Redis connected'));

    await redisClient.connect();
    return redisClient;
};

export const getRedisClient = () => {
    if (!redisClient) throw new Error('Redis client not initialised. Call connectRedis() first.');
    return redisClient;
};

export default connectRedis;
