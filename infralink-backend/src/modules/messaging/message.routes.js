import { Router } from 'express';
import * as messageController from './message.controller.js';
import authMiddleware from '../../middleware/auth.middleware.js';
import validate from '../../middleware/validate.middleware.js';
import { uploadMultiple } from '../../middleware/upload.middleware.js';
import { messageRequestSchema, sendMessageSchema, conversationSchema } from './message.validation.js';
import { verifyBlock } from '../network/middleware/block.middleware.js';
import { verifyFollowExists } from '../network/middleware/mutualFollow.middleware.js';

const router = Router();
router.use(authMiddleware);

// ─── Message Requests ─────────────────────────────────────────────────────────
router.post('/request', validate(messageRequestSchema), verifyBlock, verifyFollowExists, messageController.sendMessageRequest);
router.patch('/request/:conversationId/accept', messageController.acceptMessageRequest);
router.patch('/request/:conversationId/reject', messageController.rejectMessageRequest);
router.get('/requests', messageController.getMessageRequests);

// ─── Direct Messaging ─────────────────────────────────────────────────────────
router.post('/send', validate(sendMessageSchema), verifyBlock, verifyFollowExists, messageController.sendMessage);
router.post('/send/attachments', uploadMultiple('attachments', 10), verifyBlock, verifyFollowExists, messageController.uploadAttachments);
router.post('/conversation', validate(conversationSchema), verifyBlock, verifyFollowExists, messageController.getOrCreateDirectConversation);

// ─── Conversations & Messages ─────────────────────────────────────────────────
router.get('/conversations', messageController.getUserConversations);
router.get('/conversations/:conversationId', messageController.getMessages);

// ─── Delivery Status ──────────────────────────────────────────────────────────
router.patch('/seen/:conversationId', messageController.markSeen);

export default router;
