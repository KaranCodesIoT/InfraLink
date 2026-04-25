import { Router } from 'express';
import * as authController from './auth.controller.js';
import validate from '../../middleware/validate.middleware.js';
import { validateZod } from '../../middleware/validateZod.middleware.js';
import authMiddleware from '../../middleware/auth.middleware.js';
import { authLimiter } from '../../middleware/rateLimiter.middleware.js';
import { refreshTokenSchema } from './auth.validation.js';
import { sendOtpZodSchema, checkOtpZodSchema, loginZodSchema, googleAuthZodSchema, updateRoleZodSchema, registerZodSchema } from './auth.zod.schema.js';

const router = Router();

router.post('/register', authLimiter, validateZod(registerZodSchema), authController.register);

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

// Standard Google OAuth Routes (Redirection Flow)
router.get('/google', (req, res) => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = `https://infralink-production.up.railway.app/api/v1/auth/google/callback`;
    const scope = 'openid email profile';
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}`;
    res.redirect(googleAuthUrl);
});

router.get('/google/callback', (req, res) => {
    // This is a stub for the callback. In a full implementation, you would exchange the code for tokens.
    // For now, we redirect back to the frontend with the code so the frontend can handle it if needed.
    const frontendUrl = 'https://infra-link-sepia.vercel.app/auth/callback';
    res.redirect(`${frontendUrl}?code=${req.query.code}`);
});
router.post('/update-role', authMiddleware, validateZod(updateRoleZodSchema), authController.updateRole);

router.post('/refresh', validate(refreshTokenSchema), authController.refreshToken);
router.post('/logout', authMiddleware, authController.logout);
router.get('/me', authMiddleware, authController.getMe);

export default router;
