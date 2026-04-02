import { Router } from 'express';
import * as c from './payment.controller.js';
import authMiddleware from '../../middleware/auth.middleware.js';
import validate from '../../middleware/validate.middleware.js';
import { createPaymentSchema, verifyPaymentSchema } from './payment.validation.js';

const router = Router();

// Protected routes
router.use(authMiddleware);
router.get('/', c.listPayments);
router.get('/:id', c.getPayment);
router.post('/order', validate(createPaymentSchema), c.createOrder);
router.post('/:id/verify', validate(verifyPaymentSchema), c.verifyPayment);

export default router;
