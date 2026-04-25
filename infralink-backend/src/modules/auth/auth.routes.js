import { Router } from 'express';
import * as authController from './auth.controller.js';
import validate from '../../middleware/validate.middleware.js';
import { validateZod } from '../../middleware/validateZod.middleware.js';
import authMiddleware from '../../middleware/auth.middleware.js';
import { authLimiter } from '../../middleware/rateLimiter.middleware.js';
import { refreshTokenSchema } from './auth.validation.js';
import { sendOtpZodSchema, verifyOtpZodSchema } from './auth.zod.schema.js';

const router = Router();

/**
 * @swagger
 * /auth/send-otp:
 *   post:
 *     summary: Send OTP to phone number
 *     tags: [Auth]
 *     security: []
 */
router.post('/send-otp', authLimiter, validateZod(sendOtpZodSchema), authController.sendOtp);

/**
 * @swagger
 * /auth/verify-otp:
 *   post:
 *     summary: Verify OTP and login
 *     tags: [Auth]
 *     security: []
 */
router.post('/verify-otp', authLimiter, validateZod(verifyOtpZodSchema), authController.verifyOtp);

router.post('/refresh', validate(refreshTokenSchema), authController.refreshToken);
router.post('/logout', authMiddleware, authController.logout);
router.get('/me', authMiddleware, authController.getMe);

export default router;
