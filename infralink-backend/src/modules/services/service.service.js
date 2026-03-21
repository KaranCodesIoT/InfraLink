import ServiceRequest from './serviceRequest.model.js';
import { getPagination, buildPaginationMeta } from '../../utils/pagination.utils.js';
import { getOrCreateDirectConversation } from '../messaging/message.service.js';
import { emitNotification } from '../../events/notification.events.js';
import { canHire, getAllowedProviderRoles } from '../../constants/roles.js';
import logger from '../../utils/logger.js';

// ─── Create ───────────────────────────────────────────────────────────────────
export const createServiceRequest = async (requesterId, requesterRole, data) => {
    const { providerRole, serviceType, title, description, location, price, projectId } = data;

    // Guard — should already be checked by middleware, but defence in depth
    if (!canHire(requesterRole, providerRole)) {
        const allowed = getAllowedProviderRoles(requesterRole);
        const e = new Error(`Role "${requesterRole}" cannot hire "${providerRole}". Allowed: ${allowed.join(', ') || 'none'}`);
        e.statusCode = 403;
        throw e;
    }

    return ServiceRequest.create({
        requester: requesterId,
        requesterRole,
        providerRole,
        serviceType,
        title,
        description,
        location,
        price,
        project: projectId,
        status: 'open',
    });
};

// ─── List ─────────────────────────────────────────────────────────────────────
export const listServiceRequests = async (query) => {
    const { page, limit, skip, sort } = getPagination(query);
    const filter = {};

    if (query.status) filter.status = query.status;
    if (query.serviceType) filter.serviceType = query.serviceType;
    if (query.providerRole) filter.providerRole = query.providerRole;
    if (query.city) filter['location.city'] = new RegExp(query.city, 'i');

    const [requests, total] = await Promise.all([
        ServiceRequest.find(filter)
            .populate('requester', 'name avatar role')
            .sort(sort || '-createdAt').skip(skip).limit(limit),
        ServiceRequest.countDocuments(filter),
    ]);
    return { requests, pagination: buildPaginationMeta(total, page, limit) };
};

export const getServiceRequestById = async (id) => {
    const sr = await ServiceRequest.findById(id)
        .populate('requester', 'name avatar role')
        .populate('provider', 'name avatar role')
        .populate('applications.provider', 'name avatar role');
    if (!sr) { const e = new Error('Service request not found'); e.statusCode = 404; throw e; }
    return sr;
};

// ─── Apply ────────────────────────────────────────────────────────────────────
export const applyToServiceRequest = async (serviceRequest, providerId, providerRole, { message, proposedPrice }) => {
    if (serviceRequest.status !== 'open') {
        const e = new Error('This service request is no longer accepting applications');
        e.statusCode = 400;
        throw e;
    }

    const alreadyApplied = serviceRequest.applications.some(a => a.provider.toString() === providerId.toString());
    if (alreadyApplied) {
        const e = new Error('You have already applied to this service request');
        e.statusCode = 409;
        throw e;
    }

    serviceRequest.applications.push({ provider: providerId, providerRole, message, proposedPrice });
    serviceRequest.status = 'applied';
    await serviceRequest.save();

    // Notify the requester
    emitNotification({
        userId: serviceRequest.requester,
        title: 'New application on your service request',
        body: `Someone applied to "${serviceRequest.title}". Review and accept.`,
        type: 'service_application',
        metadata: { serviceRequestId: serviceRequest._id },
    });

    return serviceRequest;
};

// ─── Accept ───────────────────────────────────────────────────────────────────
export const acceptProvider = async (serviceRequestId, requesterId, applicationId) => {
    const sr = await ServiceRequest.findOne({ _id: serviceRequestId, requester: requesterId });
    if (!sr) { const e = new Error('Service request not found or unauthorized'); e.statusCode = 404; throw e; }
    if (!['open', 'applied'].includes(sr.status)) {
        const e = new Error('Cannot accept at this stage'); e.statusCode = 400; throw e;
    }

    const application = sr.applications.id(applicationId);
    if (!application) { const e = new Error('Application not found'); e.statusCode = 404; throw e; }

    // Set accepted provider
    sr.provider = application.provider;
    sr.providerRole = application.providerRole;
    sr.status = 'accepted';
    sr.acceptedAt = new Date();

    // Auto-create conversation thread between requester and provider
    try {
        const conversation = await getOrCreateDirectConversation(requesterId, application.provider);
        sr.conversation = conversation._id;
    } catch (convErr) {
        logger.warn(`Could not create conversation for service ${sr._id}: ${convErr.message}`);
    }

    await sr.save();

    // Notify the accepted provider
    emitNotification({
        userId: application.provider,
        title: 'You have been accepted!',
        body: `Your application for "${sr.title}" was accepted. A conversation thread has been created.`,
        type: 'service_accepted',
        metadata: { serviceRequestId: sr._id, conversationId: sr.conversation },
    });

    return sr;
};

// ─── Update Status ────────────────────────────────────────────────────────────
export const updateServiceStatus = async (serviceRequestId, userId, status) => {
    const sr = await ServiceRequest.findById(serviceRequestId);
    if (!sr) { const e = new Error('Service request not found'); e.statusCode = 404; throw e; }

    // Only requester or provider can update status
    const isRequester = sr.requester.toString() === userId.toString();
    const isProvider = sr.provider?.toString() === userId.toString();
    if (!isRequester && !isProvider) {
        const e = new Error('Not authorized to update this service request'); e.statusCode = 403; throw e;
    }

    // Lifecycle guard
    const VALID_TRANSITIONS = {
        accepted: ['in_progress', 'cancelled'],
        in_progress: ['completed', 'disputed', 'cancelled'],
    };
    if (VALID_TRANSITIONS[sr.status] && !VALID_TRANSITIONS[sr.status].includes(status)) {
        const e = new Error(`Cannot transition from "${sr.status}" to "${status}"`);
        e.statusCode = 400; throw e;
    }

    sr.status = status;
    if (status === 'in_progress') sr.startedAt = new Date();
    if (status === 'completed') sr.completedAt = new Date();
    if (status === 'cancelled') sr.cancelledAt = new Date();

    await sr.save();

    // Notify the other party
    const notifyUserId = isRequester ? sr.provider : sr.requester;
    if (notifyUserId) {
        emitNotification({
            userId: notifyUserId,
            title: `Service request status updated: ${status}`,
            body: `"${sr.title}" is now ${status}.`,
            type: 'service_status_change',
            metadata: { serviceRequestId: sr._id, status },
        });
    }

    return sr;
};

// ─── My Requests ─────────────────────────────────────────────────────────────
export const getMyServiceRequests = async (userId, query) => {
    const { page, limit, skip } = getPagination(query);
    const filter = { $or: [{ requester: userId }, { provider: userId }] };
    if (query.status) filter.status = query.status;
    const [requests, total] = await Promise.all([
        ServiceRequest.find(filter).populate('requester provider', 'name avatar role').sort('-updatedAt').skip(skip).limit(limit),
        ServiceRequest.countDocuments(filter),
    ]);
    return { requests, pagination: buildPaginationMeta(total, page, limit) };
};
