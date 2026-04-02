import { Router } from 'express';
import * as c from './builderProject.controller.js';
import authMiddleware from '../../middleware/auth.middleware.js';
import requireRole from '../../middleware/role.middleware.js';
import validate from '../../middleware/validate.middleware.js';
import { createBuilderProjectSchema, updateBuilderProjectSchema, addUpdateSchema } from './builderProject.validation.js';

const router = Router();

// Public / any-authenticated reads
router.get('/', authMiddleware, c.list);
router.get('/my', authMiddleware, requireRole('builder'), c.getMine);
router.get('/:id', authMiddleware, c.getById);

// Builder-only writes
router.post('/', authMiddleware, requireRole('builder'), validate(createBuilderProjectSchema), c.create);
router.patch('/:id', authMiddleware, requireRole('builder'), validate(updateBuilderProjectSchema), c.update);
router.post('/:id/updates', authMiddleware, requireRole('builder'), validate(addUpdateSchema), c.addUpdate);
router.delete('/:id', authMiddleware, requireRole('builder'), c.remove);

// Engagement
router.post('/:id/like', authMiddleware, c.likeProject);
router.get('/:id/comments', c.getComments);
router.post('/:id/comments', authMiddleware, c.addComment);

export default router;
