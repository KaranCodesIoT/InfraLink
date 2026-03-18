import { Router } from 'express';
import * as applicationController from './application.controller.js';
import authMiddleware from '../../middleware/auth.middleware.js';
import requireRole from '../../middleware/role.middleware.js';
import validate from '../../middleware/validate.middleware.js';
import { ROLES } from '../../constants/roles.js';
import { createApplicationSchema, updateApplicationSchema } from './application.validation.js';

const router = Router();
router.use(authMiddleware);

router.post('/', requireRole(ROLES.CONTRACTOR, ROLES.ARCHITECT, ROLES.LABOUR, ROLES.SUPPLIER, ROLES.WORKER, ROLES.BUILDER), validate(createApplicationSchema), applicationController.apply);
router.get('/job/:jobId', applicationController.listApplicationsForJob);
router.patch('/:id', requireRole(ROLES.BUILDER, ROLES.CONTRACTOR, ROLES.NORMAL_USER, ROLES.CLIENT), validate(updateApplicationSchema), applicationController.updateApplicationStatus);

export default router;
