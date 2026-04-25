import { Router } from 'express';
import * as c from './materials.controller.js';
import authMiddleware from '../../middleware/auth.middleware.js';
import validate from '../../middleware/validate.middleware.js';
import { materialSchema } from './materials.validation.js';
import cacheMiddleware from '../../middleware/cache.middleware.js';

const router = Router();

router.get('/', cacheMiddleware(300), c.listMaterials);
router.get('/:id', cacheMiddleware(300), c.getMaterial);
router.use(authMiddleware);
router.post('/', validate(materialSchema), c.createMaterial);
router.patch('/:id', validate(materialSchema.fork(Object.keys(materialSchema.describe().keys), s => s.optional())), c.updateMaterial);
router.delete('/:id', c.deleteMaterial);

export default router;
