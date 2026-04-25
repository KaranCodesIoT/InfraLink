import { getRedisClient, isRedisAvailable } from '../config/redis.js';
import logger from '../utils/logger.js';

/**
 * Generic Express Cache Middleware using Redis
 * @param {number} duration - Time to live in seconds (default: 300 = 5 minutes)
 */
export const cacheMiddleware = (duration = 300) => {
    return async (req, res, next) => {
        // Skip caching for non-GET requests
        if (req.method !== 'GET') {
            return next();
        }

        // Graceful fallback: If Redis is down/unavailable, skip caching
        if (!isRedisAvailable()) {
            return next();
        }

        const client = getRedisClient();
        if (!client) {
            return next();
        }

        // Generate a unique cache key based on the URL, query parameters, and user ID (if authenticated)
        // Example: /api/v1/jobs?page=1&limit=10_userid123
        const userId = req.user ? `_${req.user._id.toString()}` : '';
        const cacheKey = `cache:${req.originalUrl}${userId}`;

        try {
            // 1. Check if data exists in Redis
            const cachedData = await client.get(cacheKey);

            if (cachedData) {
                // 2. Data found in cache! Parse and return it
                logger.debug(`Cache hit for ${cacheKey}`);
                
                // Add a custom header so the client knows it came from cache
                res.setHeader('X-Cache', 'HIT');
                
                const parsedData = JSON.parse(cachedData);
                return res.json(parsedData);
            }

            // 3. Data not found. We need to intercept the response and save it.
            logger.debug(`Cache miss for ${cacheKey}`);
            res.setHeader('X-Cache', 'MISS');

            // Store the original res.json method so we can call it later
            const originalJson = res.json;

            // Override res.json to capture the outgoing payload
            res.json = (body) => {
                // Restore original res.json function to prevent infinite loops
                res.json = originalJson;

                // Only cache successful responses (e.g., status 200-299)
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        // Store in Redis with an expiration time (EX) in seconds
                        client.set(cacheKey, JSON.stringify(body), {
                            EX: duration
                        }).catch(err => {
                            logger.error(`Failed to set cache for ${cacheKey}: ${err.message}`);
                        });
                    } catch (err) {
                        logger.error(`Error stringifying body for cache: ${err.message}`);
                    }
                }

                // Call the original res.json to send the payload to the client
                return originalJson.call(res, body);
            };

            next();
        } catch (error) {
            // Graceful fallback: If Redis fails during fetch, log it and proceed without cache
            logger.error(`Redis cache error on GET ${cacheKey}: ${error.message}`);
            next();
        }
    };
};

export default cacheMiddleware;
