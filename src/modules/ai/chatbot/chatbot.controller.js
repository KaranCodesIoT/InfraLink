import * as chatbotService from './chatbot.service.js';
import { sendSuccess, sendCreated } from '../../../utils/response.utils.js';

export const createSession = async (req, res, next) => {
    try {
        const session = await chatbotService.createSession(req.user._id, req.body.context);
        sendCreated(res, session, 'Chat session created');
    } catch (e) { next(e); }
};

export const chat = async (req, res, next) => {
    try {
        const result = await chatbotService.chat(req.params.sessionId, req.user._id, req.body.message);
        sendSuccess(res, result);
    } catch (e) { next(e); }
};

export const getUserSessions = async (req, res, next) => {
    try {
        sendSuccess(res, await chatbotService.getUserSessions(req.user._id));
    } catch (e) { next(e); }
};

export const getSession = async (req, res, next) => {
    try {
        sendSuccess(res, await chatbotService.getSession(req.params.sessionId, req.user._id));
    } catch (e) { next(e); }
};

export const deleteSession = async (req, res, next) => {
    try {
        await chatbotService.deleteSession(req.params.sessionId, req.user._id);
        sendSuccess(res, null, 'Session deleted');
    } catch (e) { next(e); }
};
