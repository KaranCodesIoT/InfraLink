import * as assistantService from './assistant.service.js';
import { sendSuccess } from '../../../utils/response.utils.js';

export const ask = async (req, res, next) => {
    try {
        const answer = await assistantService.ask(req.user._id, req.body.question, req.user);
        sendSuccess(res, { answer });
    } catch (e) { next(e); }
};

export const getContext = async (req, res, next) => {
    try {
        sendSuccess(res, await assistantService.getContext(req.user._id));
    } catch (e) { next(e); }
};

export const updateMemory = async (req, res, next) => {
    try {
        sendSuccess(res, await assistantService.updateMemory(req.user._id, req.body), 'Memory updated');
    } catch (e) { next(e); }
};

export const clearHistory = async (req, res, next) => {
    try {
        await assistantService.clearHistory(req.user._id);
        sendSuccess(res, null, 'History cleared');
    } catch (e) { next(e); }
};
