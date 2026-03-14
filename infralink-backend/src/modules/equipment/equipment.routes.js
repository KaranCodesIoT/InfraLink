import { Router } from 'express';
import * as c from './equipment.controller.js';
import authMiddleware from '../../middleware/auth.middleware.js';
import validate from '../../middleware/validate.middleware.js';
import { equipmentSchema } from './equipment.validation.js';

const router = Router();

router.get('/', c.listEquipment);
router.get('/:id', c.getEquipment);
router.use(authMiddleware);
router.post('/', validate(equipmentSchema), c.createEquipment);
router.patch('/:id', c.updateEquipment);
router.delete('/:id', c.deleteEquipment);

export default router;
