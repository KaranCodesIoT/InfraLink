import { Router } from 'express';
import * as c from './project.controller.js';
import authMiddleware from '../../middleware/auth.middleware.js';
import validate from '../../middleware/validate.middleware.js';
import { createProjectSchema, updateProjectSchema } from './project.validation.js';

const router = Router();
router.use(authMiddleware);

router.get('/', c.listProjects);
router.get('/:id', c.getProject);
router.post('/', validate(createProjectSchema), c.createProject);
router.patch('/:id', validate(updateProjectSchema), c.updateProject);

export default router;
