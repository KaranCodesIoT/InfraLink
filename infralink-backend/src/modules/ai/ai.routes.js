import { Router } from 'express';
import authMiddleware from '../../middleware/auth.middleware.js';
import requireRole from '../../middleware/role.middleware.js';
import validate from '../../middleware/validate.middleware.js';
import upload from '../../middleware/upload.middleware.js';

// Sub-module controllers
import * as chatbotCtrl from './chatbot/chatbot.controller.js';
import * as voiceCtrl from './voice/voice.controller.js';
import * as visionCtrl from './vision/vision.controller.js';
import * as assistantCtrl from './assistant/assistant.controller.js';
import * as escalationCtrl from './escalation/escalation.controller.js';

// Validation schemas
import {
    createSessionSchema, chatSchema,
    askAssistantSchema, updateMemorySchema,
    analyseImageSchema, ttsSchema, sttSchema,
    createEscalationSchema, resolveEscalationSchema,
} from './ai.validation.js';

const router = Router();
router.use(authMiddleware);

// ─── Chatbot ──────────────────────────────────────────────────────────────────
router.post('/chatbot/sessions', validate(createSessionSchema), chatbotCtrl.createSession);
router.get('/chatbot/sessions', chatbotCtrl.getUserSessions);
router.get('/chatbot/sessions/:sessionId', chatbotCtrl.getSession);
router.post('/chatbot/sessions/:sessionId/message', validate(chatSchema), chatbotCtrl.chat);
router.delete('/chatbot/sessions/:sessionId', chatbotCtrl.deleteSession);

// ─── Personal Assistant ───────────────────────────────────────────────────────
router.post('/assistant/ask', validate(askAssistantSchema), assistantCtrl.ask);
router.get('/assistant/context', assistantCtrl.getContext);
router.patch('/assistant/memory', validate(updateMemorySchema), assistantCtrl.updateMemory);
router.delete('/assistant/history', assistantCtrl.clearHistory);

// ─── Vision ───────────────────────────────────────────────────────────────────
router.post('/vision/analyse', upload.single('image'), validate(analyseImageSchema), visionCtrl.analyseImage);

// ─── Voice ────────────────────────────────────────────────────────────────────
router.post('/voice/transcribe', upload.single('audio'), validate(sttSchema), voiceCtrl.transcribeAudio);
router.post('/voice/synthesize', validate(ttsSchema), voiceCtrl.textToSpeech);

// ─── Escalation ───────────────────────────────────────────────────────────────
router.post('/escalation', validate(createEscalationSchema), escalationCtrl.createEscalation);
router.get('/escalation', escalationCtrl.getEscalations);
router.get('/escalation/:id', escalationCtrl.getEscalationById);
router.patch('/escalation/:id/resolve', requireRole('admin', 'support'), validate(resolveEscalationSchema), escalationCtrl.resolveEscalation);

export default router;
