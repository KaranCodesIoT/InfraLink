import { Router } from 'express';
import * as workerController from './worker.controller.js';
import authMiddleware from '../../middleware/auth.middleware.js';
import requireRole from '../../middleware/role.middleware.js';
import validate from '../../middleware/validate.middleware.js';
import { workerProfileSchema } from './worker.validation.js';

const router = Router();
router.use(authMiddleware);

router.get('/', workerController.listWorkers);
router.get('/me', requireRole('worker'), workerController.getMyProfile);
router.patch('/me', requireRole('worker'), validate(workerProfileSchema), workerController.updateProfile);

export default router;
