import { Router } from 'express';
import * as directoryCtrl from './directory.controller.js';
import authMiddleware from '../../middleware/auth.middleware.js';

const router = Router();

// Protect directory behind authentication
router.use(authMiddleware);

// Get paginated list of professionals, filterable by role
router.get('/professionals', directoryCtrl.getProfessionals);

// Get counts of professionals per role for dashboard stats
router.get('/stats', directoryCtrl.getDirectoryStats);


// Get single professional profile by ID
router.get('/professionals/:id', directoryCtrl.getProfessionalById);

export default router;
