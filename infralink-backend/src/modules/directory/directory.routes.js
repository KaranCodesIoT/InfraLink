import { Router } from 'express';
import * as directoryCtrl from './directory.controller.js';
import authMiddleware from '../../middleware/auth.middleware.js';
import { verifyBlock } from '../network/middleware/block.middleware.js';
import cacheMiddleware from '../../middleware/cache.middleware.js';

const router = Router();

// Protect directory behind authentication
router.use(authMiddleware);

// Get paginated list of professionals, filterable by role
router.get('/professionals', cacheMiddleware(300), directoryCtrl.getProfessionals);

// Get counts of professionals per role for dashboard stats
router.get('/stats', cacheMiddleware(300), directoryCtrl.getDirectoryStats);


// Get single professional profile by ID
router.get('/professionals/:id', verifyBlock, cacheMiddleware(300), directoryCtrl.getProfessionalById);

export default router;
