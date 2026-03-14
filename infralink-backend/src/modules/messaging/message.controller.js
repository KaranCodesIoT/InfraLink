import * as messageService from './message.service.js';
import { sendSuccess, sendCreated, sendPaginatedSuccess } from '../../utils/response.utils.js';

export const sendMessage = async (req, res, next) => {
    try { sendCreated(res, await messageService.sendMessage(req.user._id, req.body), 'Message sent'); }
    catch (e) { next(e); }
};

export const getMessages = async (req, res, next) => {
    try {
        const { messages, pagination } = await messageService.getMessages(req.params.conversationId, req.query);
        sendPaginatedSuccess(res, messages, pagination);
    } catch (e) { next(e); }
};

export const getUserConversations = async (req, res, next) => {
    try { sendSuccess(res, await messageService.getUserConversations(req.user._id)); }
    catch (e) { next(e); }
};
