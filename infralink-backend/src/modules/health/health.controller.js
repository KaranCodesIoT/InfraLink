import mongoose from 'mongoose';
import { getRedisClient } from '../../config/redis.js';
import { sendSuccess, sendError } from '../../utils/response.utils.js';

export const healthCheck = async (req, res) => {
    const status = { api: 'ok', timestamp: new Date().toISOString() };

    // MongoDB
    try {
        status.mongo = mongoose.connection.readyState === 1 ? 'ok' : 'degraded';
    } catch {
        status.mongo = 'down';
    }

    // Redis
    try {
        await getRedisClient().ping();
        status.redis = 'ok';
    } catch {
        status.redis = 'down';
    }

    const isHealthy = status.mongo === 'ok' && status.redis === 'ok';
    if (isHealthy) {
        return sendSuccess(res, status, 'All systems operational');
    }
    return sendError(res, 'Service degraded', 503, 'SERVICE_UNAVAILABLE', status);
};
