import { Router } from 'express';
import * as jobController from './job.controller.js';
import authMiddleware from '../../middleware/auth.middleware.js';
import validate from '../../middleware/validate.middleware.js';
import { createJobSchema, updateJobSchema } from './job.validation.js';

const router = Router();
router.use(authMiddleware);

// Public listing (all authenticated users can browse jobs)
router.get('/', jobController.listJobs);
router.get('/my', jobController.getMyJobs);
router.get('/:id', jobController.getJobById);

// Any authenticated user can post, update, or delete their own job
router.post('/', validate(createJobSchema), jobController.createJob);
router.patch('/:id', validate(updateJobSchema), jobController.updateJob);
router.delete('/:id', jobController.deleteJob);

export default router;
