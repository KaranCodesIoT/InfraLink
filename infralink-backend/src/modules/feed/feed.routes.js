import { Router } from 'express';
import * as feedController from './feed.controller.js';
import authMiddleware from '../../middleware/auth.middleware.js';

const router = Router();

// Feed requires authentication
router.use(authMiddleware);

// Get personalized feed
router.get('/', feedController.getFeed);

export default router;
