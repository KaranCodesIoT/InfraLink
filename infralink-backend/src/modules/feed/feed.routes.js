import { Router } from 'express';
import * as feedController from './feed.controller.js';
import authMiddleware from '../../middleware/auth.middleware.js';
import cacheMiddleware from '../../middleware/cache.middleware.js';

const router = Router();

// Feed requires authentication
router.use(authMiddleware);

// Get personalized feed
router.get('/', cacheMiddleware(300), feedController.getFeed);

export default router;
