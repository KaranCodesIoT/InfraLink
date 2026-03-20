import express from 'express';
import * as builderController from './builder.controller.js';
import { step1Validation, step2Validation, step3Validation } from './builder.validation.js';
import authMiddleware from '../../middleware/auth.middleware.js';
import validate from '../../middleware/validate.middleware.js';
import { uploadFields } from '../../middleware/upload.middleware.js';
import requireRole from '../../middleware/role.middleware.js';

const router = express.Router();

// Step 1: Basic Profile
router.post(
    '/onboarding/step1',
    authMiddleware,
    validate(step1Validation),
    builderController.submitStep1
);

// Step 2: KYC & Legal
router.post(
    '/onboarding/step2',
    authMiddleware,
    uploadFields([
        { name: 'aadhaarCard', maxCount: 1 },
        { name: 'panCard', maxCount: 1 },
        { name: 'gstCertificate', maxCount: 1 },
        { name: 'reraCertificate', maxCount: 1 }
    ]),
    validate(step2Validation),
    builderController.submitStep2
);

// Step 3: Professional Details
router.post(
    '/onboarding/step3',
    authMiddleware,
    validate(step3Validation),
    builderController.submitStep3
);

// Admin: Verify Builder
router.put(
    '/admin/verify/:id',
    authMiddleware,
    requireRole('admin'),
    builderController.verifyBuilder
);

// SOCIAL FEATURES: Follow / Rate
router.post(
    '/:id/follow',
    authMiddleware,
    builderController.followBuilder
);

router.post(
    '/:id/unfollow',
    authMiddleware,
    builderController.unfollowBuilder
);

router.post(
    '/:id/rate',
    authMiddleware,
    builderController.rateBuilder
);

export default router;
