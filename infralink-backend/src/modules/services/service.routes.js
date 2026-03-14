import { Router } from 'express';
import * as serviceController from './service.controller.js';
import authMiddleware from '../../middleware/auth.middleware.js';
import validate from '../../middleware/validate.middleware.js';
import { validateHiringRelationship, validateApplicantRole } from './hiring.policy.js';
import {
    createServiceSchema,
    applyToServiceSchema,
    updateStatusSchema,
} from './service.validation.js';

const router = Router();
router.use(authMiddleware); // all routes require authentication

/**
 * @swagger
 * tags:
 *   name: Services
 *   description: Hiring and service request management
 */

// ─── Service Request CRUD ─────────────────────────────────────────────────────

/**
 * POST /api/v1/services
 * Create a new service request.
 * Applies hiring relationship validation before creation.
 */
router.post(
    '/',
    validate(createServiceSchema),
    validateHiringRelationship,       // ← blocks invalid role pairs
    serviceController.createServiceRequest
);

/**
 * GET /api/v1/services
 * Public listing with optional filters: status, serviceType, providerRole, city
 */
router.get('/', serviceController.listServiceRequests);

/**
 * GET /api/v1/services/mine
 * Authenticated user's service requests (as requester or provider)
 */
router.get('/mine', serviceController.getMyServiceRequests);

/**
 * GET /api/v1/services/:id
 * Get a single service request with populated applications
 */
router.get('/:id', serviceController.getServiceRequestById);

// ─── Application Flow ─────────────────────────────────────────────────────────

/**
 * POST /api/v1/services/:id/apply
 * A provider applies to a service request.
 * validateApplicantRole checks the applicant's role matches what the requester needs.
 */
router.post(
    '/:id/apply',
    validateApplicantRole,            // ← fetches SR + checks role eligibility
    validate(applyToServiceSchema),
    serviceController.applyToServiceRequest
);

/**
 * PATCH /api/v1/services/:id/accept/:applicationId
 * Requester accepts a specific application.
 * Auto-creates a messaging conversation thread.
 */
router.patch('/:id/accept/:applicationId', serviceController.acceptProvider);

// ─── Status Management ────────────────────────────────────────────────────────

/**
 * PATCH /api/v1/services/:id/status
 * Update service lifecycle status (in_progress, completed, cancelled, disputed).
 * Only requester or accepted provider can do this.
 */
router.patch('/:id/status', validate(updateStatusSchema), serviceController.updateServiceStatus);

export default router;
