import { Router } from 'express';
import * as authController from './auth.controller.js';
import validate from '../../middleware/validate.middleware.js';
import { validateZod } from '../../middleware/validateZod.middleware.js';
import authMiddleware from '../../middleware/auth.middleware.js';
import { authLimiter } from '../../middleware/rateLimiter.middleware.js';
import { refreshTokenSchema } from './auth.validation.js';
import { sendOtpZodSchema, checkOtpZodSchema, loginZodSchema, googleAuthZodSchema, updateRoleZodSchema } from './auth.zod.schema.js';

const router = Router();

/**
 * @swagger
 * /auth/send-otp:
 *   post:
 *     summary: Send OTP to email
 *     tags: [Auth]
 *     security: []
 */
router.post('/send-otp', authLimiter, validateZod(sendOtpZodSchema), authController.sendOtp);

/**
 * @swagger
 * /auth/check-otp:
 *   post:
 *     summary: Verify OTP without logging in
 *     tags: [Auth]
 *     security: []
 */
router.post('/check-otp', authLimiter, validateZod(checkOtpZodSchema), authController.checkOtp);

/**
 * @swagger
 * /auth/verify-otp:
 *   post:
 *     summary: Login with password after OTP verification
 *     tags: [Auth]
 *     security: []
 */
router.post('/verify-otp', authLimiter, validateZod(loginZodSchema), authController.verifyOtp);

router.post('/google-auth', authLimiter, validateZod(googleAuthZodSchema), authController.googleAuth);
router.post('/update-role', authMiddleware, validateZod(updateRoleZodSchema), authController.updateRole);

router.post('/refresh', validate(refreshTokenSchema), authController.refreshToken);
router.post('/logout', authMiddleware, authController.logout);
router.get('/me', authMiddleware, authController.getMe);

export default router;
