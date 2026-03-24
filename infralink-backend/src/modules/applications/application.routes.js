import { Router } from 'express';
import * as applicationController from './application.controller.js';
import authMiddleware from '../../middleware/auth.middleware.js';
import validate from '../../middleware/validate.middleware.js';
import { createApplicationSchema, updateApplicationSchema } from './application.validation.js';

const router = Router();
router.use(authMiddleware);

// Any authenticated user can apply (prevent self-apply is enforced in service)
router.post('/', validate(createApplicationSchema), applicationController.apply);
router.get('/my', applicationController.getMyApplications);
router.get('/job/:jobId', applicationController.listApplicationsForJob);
router.patch('/:id', validate(updateApplicationSchema), applicationController.updateApplicationStatus);

export default router;
