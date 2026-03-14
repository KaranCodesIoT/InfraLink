import * as serviceService from './service.service.js';
import { sendSuccess, sendCreated, sendPaginatedSuccess } from '../../utils/response.utils.js';

export const createServiceRequest = async (req, res, next) => {
    try {
        const sr = await serviceService.createServiceRequest(req.user._id, req.user.role, req.body);
        sendCreated(res, sr, 'Service request created');
    } catch (e) { next(e); }
};

export const listServiceRequests = async (req, res, next) => {
    try {
        const { requests, pagination } = await serviceService.listServiceRequests(req.query);
        sendPaginatedSuccess(res, requests, pagination);
    } catch (e) { next(e); }
};

export const getServiceRequestById = async (req, res, next) => {
    try {
        sendSuccess(res, await serviceService.getServiceRequestById(req.params.id));
    } catch (e) { next(e); }
};

export const applyToServiceRequest = async (req, res, next) => {
    try {
        // req.serviceRequest was set by validateApplicantRole middleware
        const sr = await serviceService.applyToServiceRequest(
            req.serviceRequest,
            req.user._id,
            req.user.role,
            req.body
        );
        sendSuccess(res, sr, 'Application submitted');
    } catch (e) { next(e); }
};

export const acceptProvider = async (req, res, next) => {
    try {
        const sr = await serviceService.acceptProvider(req.params.id, req.user._id, req.params.applicationId);
        sendSuccess(res, sr, 'Provider accepted — conversation thread created');
    } catch (e) { next(e); }
};

export const updateServiceStatus = async (req, res, next) => {
    try {
        const sr = await serviceService.updateServiceStatus(req.params.id, req.user._id, req.body.status);
        sendSuccess(res, sr, `Status updated to "${req.body.status}"`);
    } catch (e) { next(e); }
};

export const getMyServiceRequests = async (req, res, next) => {
    try {
        const { requests, pagination } = await serviceService.getMyServiceRequests(req.user._id, req.query);
        sendPaginatedSuccess(res, requests, pagination);
    } catch (e) { next(e); }
};
