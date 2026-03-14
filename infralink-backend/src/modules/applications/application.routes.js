import { Router } from 'express';
import * as applicationController from './application.controller.js';
import authMiddleware from '../../middleware/auth.middleware.js';
import requireRole from '../../middleware/role.middleware.js';
import validate from '../../middleware/validate.middleware.js';
import { createApplicationSchema, updateApplicationSchema } from './application.validation.js';

const router = Router();
router.use(authMiddleware);

router.post('/', requireRole('worker'), validate(createApplicationSchema), applicationController.apply);
router.get('/job/:jobId', applicationController.listApplicationsForJob);
router.patch('/:id', requireRole('client', 'contractor'), validate(updateApplicationSchema), applicationController.updateApplicationStatus);

export default router;
