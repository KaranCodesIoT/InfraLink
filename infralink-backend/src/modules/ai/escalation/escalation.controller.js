import * as escalationService from './escalation.service.js';
import { sendCreated, sendSuccess, sendPaginatedSuccess } from '../../../utils/response.utils.js';

export const createEscalation = async (req, res, next) => {
    try {
        sendCreated(res, await escalationService.createEscalation(req.user._id, req.body), 'Escalation created — a support agent will contact you shortly');
    } catch (e) { next(e); }
};

export const getEscalations = async (req, res, next) => {
    try {
        const { escalations, pagination } = await escalationService.getEscalations(req.user._id, req.query);
        sendPaginatedSuccess(res, escalations, pagination);
    } catch (e) { next(e); }
};

export const getEscalationById = async (req, res, next) => {
    try {
        sendSuccess(res, await escalationService.getEscalationById(req.params.id));
    } catch (e) { next(e); }
};

export const resolveEscalation = async (req, res, next) => {
    try {
        sendSuccess(res, await escalationService.resolveEscalation(req.params.id, req.user._id, req.body.resolution), 'Escalation resolved');
    } catch (e) { next(e); }
};
