import { Router } from 'express';
import * as matchingController from './matching.controller.js';
import authMiddleware from '../../middleware/auth.middleware.js';
import requireRole from '../../middleware/role.middleware.js';

const router = Router();
router.use(authMiddleware);

router.post('/job/:jobId/trigger', requireRole('client', 'contractor', 'admin'), matchingController.triggerMatching);
router.get('/job/:jobId', matchingController.getMatchesForJob);

export default router;
