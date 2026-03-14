import { Router } from 'express';
import * as messageController from './message.controller.js';
import authMiddleware from '../../middleware/auth.middleware.js';
import validate from '../../middleware/validate.middleware.js';
import { sendMessageSchema } from './message.validation.js';

const router = Router();
router.use(authMiddleware);

router.get('/conversations', messageController.getUserConversations);
router.get('/conversations/:conversationId', messageController.getMessages);
router.post('/', validate(sendMessageSchema), messageController.sendMessage);

export default router;
