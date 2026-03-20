import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import swaggerUi from 'swagger-ui-express';

import corsOptions from './config/cors.js';
import swaggerSpec from './config/swagger.js';
import loggerMiddleware from './middleware/logger.middleware.js';
import errorMiddleware from './middleware/error.middleware.js';
import { defaultLimiter } from './middleware/rateLimiter.middleware.js';

// Security layer
import helmetOptions from './security/helmet.config.js';
import sanitizerMiddleware from './security/sanitizer.js';

// Monitoring layer
import { metricsMiddleware, metricsHandler } from './monitoring/metrics.js';
import { sentryErrorHandler } from './monitoring/tracing.js';

// Routes
import authRoutes from './modules/auth/auth.routes.js';
import userRoutes from './modules/users/user.routes.js';
import workerRoutes from './modules/workers/worker.routes.js';
import jobRoutes from './modules/jobs/job.routes.js';
import applicationRoutes from './modules/applications/application.routes.js';
import matchingRoutes from './modules/matching/matching.routes.js';
import messageRoutes from './modules/messaging/message.routes.js';
import notificationRoutes from './modules/notifications/notification.routes.js';
import reviewRoutes from './modules/reviews/review.routes.js';
import marketplaceRoutes from './modules/marketplace/materials.routes.js';
import equipmentRoutes from './modules/equipment/equipment.routes.js';
import projectRoutes from './modules/projects/project.routes.js';
import paymentRoutes from './modules/payments/payment.routes.js';
import searchRoutes from './modules/search/search.routes.js';
import healthRoutes from './modules/health/health.routes.js';
import aiRoutes from './modules/ai/ai.routes.js';
import serviceRoutes from './modules/services/service.routes.js';
import directoryRoutes from './modules/directory/directory.routes.js';
import builderRoutes from './modules/builders/builder.routes.js';
import contractorRoutes from './modules/contractors/contractor.routes.js';

const app = express();

// Security
app.use(helmet(helmetOptions));
app.use(cors(corsOptions));
app.use(sanitizerMiddleware);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(compression());

// Logging
app.use(loggerMiddleware);

// Metrics
app.use(metricsMiddleware);

// Global rate limit
app.use('/api', defaultLimiter);

// Swagger docs
if (process.env.SWAGGER_ENABLED !== 'false') {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

// Prometheus metrics endpoint (internal — protect behind VPN/IP allowlist in prod)
app.get('/metrics', metricsHandler);

// API Routes (v1)
const V1 = '/api/v1';
app.use(`${V1}/auth`, authRoutes);
app.use(`${V1}/users`, userRoutes);
app.use(`${V1}/workers`, workerRoutes);
app.use(`${V1}/jobs`, jobRoutes);
app.use(`${V1}/applications`, applicationRoutes);
app.use(`${V1}/matching`, matchingRoutes);
app.use(`${V1}/messages`, messageRoutes);
app.use(`${V1}/notifications`, notificationRoutes);
app.use(`${V1}/reviews`, reviewRoutes);
app.use(`${V1}/marketplace`, marketplaceRoutes);
app.use(`${V1}/equipment`, equipmentRoutes);
app.use(`${V1}/projects`, projectRoutes);
app.use(`${V1}/payments`, paymentRoutes);
app.use(`${V1}/services`, serviceRoutes);
app.use(`${V1}/search`, searchRoutes);
app.use(`${V1}/health`, healthRoutes);
app.use(`${V1}/ai`, aiRoutes);
app.use(`${V1}/directory`, directoryRoutes);
app.use(`${V1}/builders`, builderRoutes);
app.use(`${V1}/contractors`, contractorRoutes);

// Root Route (Welcome)
app.get('/', (req, res) => {
    res.json({ success: true, message: '🚀 InfraLink API is running normally!' });
});

// 404 handler
app.use((_req, res) => {
    res.status(404).json({ success: false, error: { message: 'Route not found' } });
});

// Sentry error capture (before custom error handler)
app.use(sentryErrorHandler);

// Global error handler (must be last)
app.use(errorMiddleware);

export default app;
