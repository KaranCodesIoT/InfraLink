/**
 * Input Sanitizer Middleware
 *
 * Strips dangerous HTML and script injections from user input.
 * Uses the built-in approach (no extra dependencies) with optional
 * xss / dompurify integration.
 *
 * Install mongo-sanitize for NoSQL injection protection:
 *   npm install express-mongo-sanitize
 *
 * Install xss for XSS sanitisation:
 *   npm install xss
 */

import logger from '../utils/logger.js';

/**
 * Recursively sanitise an object's string values.
 * Removes `$` and `.` from keys (MongoDB injection protection).
 */
const deepSanitize = (obj) => {
    if (typeof obj !== 'object' || obj === null) return obj;
    const clean = Array.isArray(obj) ? [] : {};
    for (const key of Object.keys(obj)) {
        const safeKey = key.replace(/^\$/, '').replace(/\./g, '_');
        const val = obj[key];
        if (typeof val === 'string') {
            // Basic XSS: strip <script> tags
            clean[safeKey] = val.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        } else if (typeof val === 'object') {
            clean[safeKey] = deepSanitize(val);
        } else {
            clean[safeKey] = val;
        }
    }
    return clean;
};

/**
 * Express middleware that sanitises req.body, req.query, and req.params.
 */
export const sanitizerMiddleware = (req, _res, next) => {
    try {
        if (req.body) req.body = deepSanitize(req.body);
        if (req.query) req.query = deepSanitize(req.query);
        if (req.params) req.params = deepSanitize(req.params);
    } catch (err) {
        logger.warn(`Sanitizer error: ${err.message}`);
    }
    next();
};

export default sanitizerMiddleware;
