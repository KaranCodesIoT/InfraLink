/**
 * Tracing — OpenTelemetry / Sentry integration stub.
 *
 * For Sentry: npm install @sentry/node
 * For OpenTelemetry: npm install @opentelemetry/sdk-node
 *
 * Replace the stub below with the appropriate SDK once keys are configured.
 */
import logger from '../utils/logger.js';

let sentryInitialised = false;

/**
 * Initialise Sentry error tracking.
 * Call once in server.js before app startup.
 */
export const initSentry = async () => {
    const dsn = process.env.SENTRY_DSN;
    if (!dsn) {
        logger.warn('SENTRY_DSN not set — Sentry tracing disabled');
        return;
    }
    try {
        const Sentry = await import('@sentry/node');
        Sentry.init({
            dsn,
            environment: process.env.NODE_ENV || 'development',
            tracesSampleRate: parseFloat(process.env.SENTRY_TRACE_RATE || '0.1'),
        });
        sentryInitialised = true;
        logger.info('Sentry tracing initialised');
    } catch {
        logger.warn('Sentry SDK not installed — run: npm install @sentry/node');
    }
};

/**
 * Express error handler that forwards to Sentry.
 * Mount AFTER all routes but BEFORE your custom error middleware.
 */
export const sentryErrorHandler = async (err, req, res, next) => {
    if (sentryInitialised) {
        try {
            const Sentry = await import('@sentry/node');
            Sentry.captureException(err);
        } catch { /* ignore */ }
    }
    next(err);
};

/**
 * Capture a custom event or exception from service layer.
 */
export const captureException = async (error, context = {}) => {
    logger.error(`[Tracing] Exception: ${error.message}`, context);
    if (!sentryInitialised) return;
    try {
        const Sentry = await import('@sentry/node');
        Sentry.captureException(error, { extra: context });
    } catch { /* ignore */ }
};
