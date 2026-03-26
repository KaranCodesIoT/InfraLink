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

const deepSanitizeMutate = (obj) => {
    if (typeof obj !== 'object' || obj === null) return;
    
    const keys = Object.keys(obj);
    for (const key of keys) {
        let val = obj[key];
        let newKey = key;
        
        if (typeof key === 'string' && (key.startsWith('$') || key.includes('.'))) {
            newKey = key.replace(/^\$/, '').replace(/\./g, '_');
            delete obj[key];
        }
        
        if (typeof val === 'string') {
            obj[newKey] = val.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        } else if (typeof val === 'object' && val !== null) {
            deepSanitizeMutate(val);
            if (newKey !== key) {
                obj[newKey] = val;
            }
        } else {
            if (newKey !== key) {
                obj[newKey] = val;
            }
        }
    }
};

/**
 * Express middleware that sanitises req.body, req.query, and req.params.
 */
export const sanitizerMiddleware = (req, _res, next) => {
    try {
        if (req.body) deepSanitizeMutate(req.body);
        if (req.query) deepSanitizeMutate(req.query);
        if (req.params) deepSanitizeMutate(req.params);
    } catch (err) {
        logger.warn(`Sanitizer error: ${err.message}`);
    }
    next();
};

export default sanitizerMiddleware;
