import { Router } from 'express';
import { search } from './search.controller.js';
import { optionalAuth } from '../../middleware/auth.middleware.js';
import cacheMiddleware from '../../middleware/cache.middleware.js';

const router = Router();
// Public search endpoint with optional auth context
router.get('/', optionalAuth, cacheMiddleware(300), search);

export default router;
