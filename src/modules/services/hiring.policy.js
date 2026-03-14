/**
 * Hiring Policy Middleware
 *
 * Validates that the requester's role is allowed to hire the requested providerRole.
 * Uses the HIRING_RULES map in roles.js as the single source of truth.
 */
import { canHire, getAllowedProviderRoles } from '../../constants/roles.js';
import { sendError } from '../../utils/response.utils.js';
import { HTTP_STATUS } from '../../constants/httpStatus.js';

/**
 * Middleware: validates req.user.role can hire req.body.providerRole.
 * Must run AFTER authMiddleware.
 */
export const validateHiringRelationship = (req, res, next) => {
    const requesterRole = req.user?.role;
    const providerRole = req.body?.providerRole;

    if (!requesterRole) {
        return sendError(res, 'Authentication required', HTTP_STATUS.UNAUTHORIZED, 'UNAUTHORIZED');
    }

    if (!providerRole) {
        return sendError(res, 'providerRole is required', HTTP_STATUS.BAD_REQUEST, 'VALIDATION_ERROR');
    }

    if (!canHire(requesterRole, providerRole)) {
        const allowed = getAllowedProviderRoles(requesterRole);
        const message = allowed.length
            ? `As a ${requesterRole}, you can only hire: ${allowed.join(', ')}. Requested: ${providerRole}`
            : `The role "${requesterRole}" is not permitted to hire other roles on this platform.`;
        return sendError(res, message, HTTP_STATUS.FORBIDDEN, 'HIRING_RULE_VIOLATION');
    }

    // Attach validated roles to request for downstream use
    req.hiringContext = { requesterRole, providerRole };
    next();
};

/**
 * Middleware: validate that the applying provider's role matches the required providerRole.
 * Used on POST /services/:id/apply
 */
export const validateApplicantRole = async (req, res, next) => {
    try {
        const ServiceRequest = (await import('../services/serviceRequest.model.js')).default;
        const serviceRequest = await ServiceRequest.findById(req.params.id);

        if (!serviceRequest) {
            return sendError(res, 'Service request not found', HTTP_STATUS.NOT_FOUND, 'NOT_FOUND');
        }

        // Check if the applicant's role is allowed by the hiring rule for this request
        const applicantRole = req.user?.role;
        if (!canHire(serviceRequest.requesterRole, applicantRole)) {
            return sendError(
                res,
                `Your role (${applicantRole}) is not eligible to apply for this service request (requires: ${getAllowedProviderRoles(serviceRequest.requesterRole).join(' or ')})`,
                HTTP_STATUS.FORBIDDEN,
                'HIRING_RULE_VIOLATION'
            );
        }

        req.serviceRequest = serviceRequest;
        next();
    } catch (err) {
        next(err);
    }
};
