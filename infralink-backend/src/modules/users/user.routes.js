import { Router } from 'express';
import * as userController from './user.controller.js';
import authMiddleware from '../../middleware/auth.middleware.js';
import requireRole from '../../middleware/role.middleware.js';
import validate from '../../middleware/validate.middleware.js';
import { updateUserSchema } from './user.validation.js';
import { uploadSingle } from '../../middleware/upload.middleware.js';
import { verifyBlock } from '../network/middleware/block.middleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/me', userController.getMe);
router.get('/', requireRole('admin'), userController.getAllUsers);
router.get('/:id', verifyBlock, userController.getUserById);
router.patch('/:id', validate(updateUserSchema), userController.updateUser);
router.post('/:id/avatar', uploadSingle('avatar'), userController.uploadAvatar);
router.post('/:id/resume', uploadSingle('resume'), userController.uploadResume);
router.delete('/:id', requireRole('admin'), userController.deleteUser);

export default router;
