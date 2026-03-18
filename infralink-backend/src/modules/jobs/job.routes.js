import { Router } from 'express';
import * as jobController from './job.controller.js';
import authMiddleware from '../../middleware/auth.middleware.js';
import requireRole from '../../middleware/role.middleware.js';
import validate from '../../middleware/validate.middleware.js';
import { ROLES } from '../../constants/roles.js';
import { createJobSchema, updateJobSchema } from './job.validation.js';

const router = Router();
router.use(authMiddleware);

router.get('/', jobController.listJobs);
router.get('/:id', jobController.getJobById);
router.post('/', requireRole(ROLES.BUILDER, ROLES.CONTRACTOR, ROLES.NORMAL_USER, ROLES.CLIENT), validate(createJobSchema), jobController.createJob);
router.patch('/:id', requireRole(ROLES.BUILDER, ROLES.CONTRACTOR, ROLES.NORMAL_USER, ROLES.CLIENT), validate(updateJobSchema), jobController.updateJob);
router.delete('/:id', requireRole(ROLES.BUILDER, ROLES.CONTRACTOR, ROLES.NORMAL_USER, ROLES.CLIENT, ROLES.ADMIN), jobController.deleteJob);

export default router;
