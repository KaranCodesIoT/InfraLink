import * as assistantService from './assistant.service.js';
import * as infralinkAssistant from './InfralinkAssistant.service.js';
import { sendSuccess } from '../../../utils/response.utils.js';

export const askInfralink = async (req, res, next) => {
    try {
        const userId = req.user?._id || null;

        // Set up SSE
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        // Callback to stream chunks to the frontend
        const onChunk = (chunk) => {
            res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
        };

        const result = await infralinkAssistant.askAssistant(
            req.body.question, 
            userId, 
            req.body.language, 
            onChunk
        );

        // Final payload with actions and data
        res.write(`data: ${JSON.stringify({ metadata: result })}\n\n`);
        res.end();
    } catch (e) { 
        if (!res.headersSent) {
            next(e);
        } else {
            res.write(`data: ${JSON.stringify({ error: e.message })}\n\n`);
            res.end();
        }
    }
};

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

export const getHistory = async (req, res, next) => {
    try {
        const history = await infralinkAssistant.getChatHistory(req.user?._id || null);
        sendSuccess(res, history);
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
