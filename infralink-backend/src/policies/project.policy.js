/**
 * Project Policy
 *
 * Fine-grained authorization rules for project-related actions.
 */
import { sendError } from '../utils/response.utils.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { ERROR_CODES } from '../constants/errorCodes.js';
import { ROLES } from '../constants/roles.js';
import { policyMiddleware } from './job.policy.js';

export const canCreateProject = (user) =>
    [ROLES.CLIENT, ROLES.CONTRACTOR].includes(user.role);

export const canUpdateProject = (user, project) =>
    user.role === ROLES.ADMIN ||
    project.client.toString() === user._id.toString();

export const canDeleteProject = (user, project) =>
    user.role === ROLES.ADMIN ||
    project.client.toString() === user._id.toString();

export const canViewProject = (user, project) =>
    user.role === ROLES.ADMIN ||
    project.client.toString() === user._id.toString() ||
    project.workers.some((w) => w.toString() === user._id.toString());

export const canAddWorkerToProject = (user, project) =>
    user.role === ROLES.ADMIN ||
    project.client.toString() === user._id.toString();

// ─── Middleware shortcuts ─────────────────────────────────────────────────────

export const requireCanCreateProject = policyMiddleware(canCreateProject);

export { policyMiddleware };
