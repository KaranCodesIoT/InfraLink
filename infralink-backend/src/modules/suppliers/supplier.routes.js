import express from 'express';
import * as supplierController from './supplier.controller.js';
import authMiddleware from '../../middleware/auth.middleware.js';
import validate from '../../middleware/validate.middleware.js';
import { uploadFields } from '../../middleware/upload.middleware.js';
import { supplierStep1Schema, supplierStep2Schema, supplierStep3Schema, supplierStep4Schema } from './supplier.validation.js';

const router = express.Router();

// Get Profile
router.get('/me', authMiddleware, supplierController.getMyProfile);
router.get('/:id', supplierController.getSupplier);

// Step 1: Basic Details & Location
router.post(
    '/onboarding/step1',
    authMiddleware,
    uploadFields([{ name: 'logo', maxCount: 1 }]),
    validate(supplierStep1Schema),
    supplierController.submitStep1
);

// Step 2: KYC & Trust
router.post(
    '/onboarding/step2',
    authMiddleware,
    uploadFields([{ name: 'businessLicense', maxCount: 1 }]),
    validate(supplierStep2Schema),
    supplierController.submitStep2
);

// Step 3: Logistics & Pricing
router.post(
    '/onboarding/step3',
    authMiddleware,
    validate(supplierStep3Schema),
    supplierController.submitStep3
);

// Step 4: Portfolio
router.post(
    '/onboarding/step4',
    authMiddleware,
    validate(supplierStep4Schema),
    supplierController.submitStep4
);

// Admin: Verify Supplier
import requireRole from '../../middleware/role.middleware.js';
router.put(
    '/admin/verify/:id',
    authMiddleware,
    requireRole('admin'),
    supplierController.verifySupplier
);

// Advanced: Buyers Requesting Quotes
router.post(
    '/:id/quote',
    authMiddleware,
    supplierController.requestQuote
);

router.post(
    '/:id/rate',
    authMiddleware,
    supplierController.rateSupplier
);

router.post(
    '/products',
    authMiddleware,
    supplierController.addProduct
);

export default router;
