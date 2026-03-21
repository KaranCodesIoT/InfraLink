import * as messageService from './message.service.js';
import { sendSuccess, sendCreated, sendPaginatedSuccess } from '../../utils/response.utils.js';

// ─── Message Requests ─────────────────────────────────────────────────────────

export const sendMessageRequest = async (req, res, next) => {
    try {
        const result = await messageService.sendMessageRequest(req.user._id, req.body);
        sendCreated(res, result, 'Message request sent');
    } catch (e) { next(e); }
};

export const acceptMessageRequest = async (req, res, next) => {
    try {
        const conversation = await messageService.acceptMessageRequest(req.params.conversationId, req.user._id);
        sendSuccess(res, conversation, 'Message request accepted');
    } catch (e) { next(e); }
};

export const rejectMessageRequest = async (req, res, next) => {
    try {
        const conversation = await messageService.rejectMessageRequest(req.params.conversationId, req.user._id);
        sendSuccess(res, conversation, 'Message request rejected');
    } catch (e) { next(e); }
};

// ─── Direct Messaging ─────────────────────────────────────────────────────────

export const sendMessage = async (req, res, next) => {
    try {
        const message = await messageService.sendMessage(req.user._id, req.body);
        sendCreated(res, message, 'Message sent');
    } catch (e) { next(e); }
};

export const uploadAttachments = async (req, res, next) => {
    try {
        if (!req.files || !req.files.attachments) {
            const err = new Error('No attachments uploaded');
            err.statusCode = 400; // BadRequest
            throw err;
        }
        
        const attachments = await messageService.uploadAttachments(req.files.attachments, req);
        sendSuccess(res, attachments, 'Attachments uploaded successfully');
    } catch (e) { next(e); }
};

// ─── Conversations ────────────────────────────────────────────────────────────

export const getUserConversations = async (req, res, next) => {
    try {
        const conversations = await messageService.getUserConversations(req.user._id);
        sendSuccess(res, conversations);
    } catch (e) { next(e); }
};

export const getMessageRequests = async (req, res, next) => {
    try {
        const requests = await messageService.getMessageRequests(req.user._id);
        sendSuccess(res, requests);
    } catch (e) { next(e); }
};

export const getMessages = async (req, res, next) => {
    try {
        const { messages, conversation, pagination } = await messageService.getMessages(
            req.params.conversationId,
            req.user._id,
            req.query
        );
        sendPaginatedSuccess(res, { messages, conversation }, pagination);
    } catch (e) { next(e); }
};

// ─── Delivery Status ──────────────────────────────────────────────────────────

export const markSeen = async (req, res, next) => {
    try {
        const result = await messageService.markSeen(req.params.conversationId, req.user._id);
        sendSuccess(res, result, 'Messages marked as seen');
    } catch (e) { next(e); }
};

// ─── Direct Conversation (for connected users) ───────────────────────────────

export const getOrCreateDirectConversation = async (req, res, next) => {
    try {
        const conversation = await messageService.getOrCreateDirectConversation(
            req.user._id,
            req.body.recipientId,
            req.body.projectContext,
            req.body.workIntent
        );
        sendSuccess(res, conversation, 'Conversation ready');
    } catch (e) { next(e); }
};
