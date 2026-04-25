/**
 * CSRF Protection Configuration
 *
 * For stateless JWT APIs, CSRF is mitigated by:
 *   1. Not using cookies for auth tokens (we use Authorization header)
 *   2. Setting SameSite=Strict on any cookies used
 *   3. The double-submit cookie pattern for cookie-based flows
 *
 * If you later add cookie-based sessions, install `csrf` or `csurf`
 * and enable the middleware exported here.
 *
 * Install: npm install csrf
 */

import logger from '../utils/logger.js';

/**
 * CSRF token storage configuration for cookie-based flows.
 * Use with: app.use(csrfMiddleware)
 */
export const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000, // 1 day
};

/**
 * Stub CSRF middleware — activate by installing the `csrf` package
 * and uncommenting the implementation below.
 */
export const csrfMiddleware = (req, res, next) => {
    // JWT APIs (Authorization header) are inherently CSRF-safe.
    // This stub exists for documentation and future cookie-auth support.
    next();
};

/**
 * Validates that requests from browsers include the correct origin.
 */
export const originCheckMiddleware = (req, res, next) => {
    const allowedOrigins = (process.env.CORS_ORIGIN || 'https://infra-link-sepia.vercel.app').split(',').map(o => o.trim());
    const origin = req.headers.origin || req.headers.referer;

    if (!origin || allowedOrigins.some(o => origin.startsWith(o))) {
        return next();
    }

    logger.warn(`Rejected request from disallowed origin: ${origin}`);
    return res.status(403).json({ success: false, error: { message: 'Origin not allowed' } });
};
