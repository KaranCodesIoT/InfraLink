import { Router } from 'express';
import * as contractorController from './contractor.controller.js';
import authMiddleware from '../../middleware/auth.middleware.js';
import requireRole from '../../middleware/role.middleware.js';
import { uploadFields } from '../../middleware/upload.middleware.js';

const router = Router();

// Onboarding Flow
router.post(
    '/onboarding/step1',
    authMiddleware,
    contractorController.saveStep1
);

router.post(
    '/onboarding/step2',
    authMiddleware,
    uploadFields([
        { name: 'aadhaarCard', maxCount: 1 },
        { name: 'panCard', maxCount: 1 },
        { name: 'gstCertificate', maxCount: 1 }
    ]),
    contractorController.saveStep2
);

router.post(
    '/onboarding/step3',
    authMiddleware,
    contractorController.saveStep3
);

// ─── Portfolio Projects CRUD ───────────────────────────────────────────────────
router.post(
    '/projects',
    authMiddleware,
    contractorController.addProject
);

router.delete(
    '/projects/:projectId',
    authMiddleware,
    contractorController.removeProject
);

// Admin: Verify / Reject Contractor
router.put(
    '/admin/verify/:id',
    authMiddleware,
    requireRole('admin'),
    contractorController.verifyContractor
);

router.put(
    '/admin/reject/:id',
    authMiddleware,
    requireRole('admin'),
    contractorController.rejectContractor
);

// SOCIAL FEATURES: Follow / Rate
router.post(
    '/:id/follow',
    authMiddleware,
    contractorController.followContractor
);

router.post(
    '/:id/unfollow',
    authMiddleware,
    contractorController.unfollowContractor
);

// Get logged in contractor profile (for onboarding/edit)
router.get(
    '/me/profile',
    authMiddleware,
    contractorController.getMyProfile
);

router.get(
    '/:id',
    contractorController.getContractorProfile
);

export default router;
