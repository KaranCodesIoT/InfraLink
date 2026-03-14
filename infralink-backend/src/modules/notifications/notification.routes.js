import { Router } from 'express';
import * as notificationController from './notification.controller.js';
import authMiddleware from '../../middleware/auth.middleware.js';

const router = Router();
router.use(authMiddleware);

router.get('/', notificationController.getNotifications);
router.patch('/:id/read', notificationController.markAsRead);
router.patch('/read-all', notificationController.markAllAsRead);

export default router;
