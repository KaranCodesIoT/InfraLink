/**
 * Job Policy
 *
 * Fine-grained authorization rules for job-related actions,
 * beyond simple role checks. Import individual policy functions
 * and call them in controllers or use `policyMiddleware()` in routes.
 */
import { sendError } from '../utils/response.utils.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { ERROR_CODES } from '../constants/errorCodes.js';
import { ROLES } from '../constants/roles.js';

// ─── Rule functions — return true if allowed ─────────────────────────────────

export const canCreateJob = (user) =>
    [ROLES.CLIENT, ROLES.CONTRACTOR].includes(user.role);

export const canApplyToJob = (user) =>
    user.role === ROLES.WORKER;

export const canUpdateJob = (user, job) =>
    user.role === ROLES.ADMIN ||
    (user.role === ROLES.CLIENT && job.client.toString() === user._id.toString()) ||
    (user.role === ROLES.CONTRACTOR && job.client.toString() === user._id.toString());

export const canDeleteJob = (user, job) =>
    user.role === ROLES.ADMIN || job.client.toString() === user._id.toString();

export const canViewApplications = (user, job) =>
    user.role === ROLES.ADMIN || job.client.toString() === user._id.toString();

// ─── Middleware factory ───────────────────────────────────────────────────────

/**
 * Express middleware that applies a policy rule.
 * @param {(user: object, target?: object) => boolean} policyFn
 * @param {(req: object) => object} [targetResolver] — extracts the target resource from req
 */
export const policyMiddleware = (policyFn, targetResolver = null) => {
    return (req, res, next) => {
        const target = targetResolver ? targetResolver(req) : null;
        if (policyFn(req.user, target)) return next();
        return sendError(
            res,
            'You are not authorized to perform this action',
            HTTP_STATUS.FORBIDDEN,
            ERROR_CODES.FORBIDDEN
        );
    };
};
