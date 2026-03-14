import './config/env.js'; // validate env first
import http from 'http';
import app from './app.js';
import connectDB from './config/database.js';
import connectRedis from './config/redis.js';
import { configureCloudinary } from './config/cloudinary.js';
import { initSocket } from './config/socket.js';
import logger from './utils/logger.js';

// Register domain event listeners (must import to activate handlers)
import './events/job.events.js';
import './events/match.events.js';
import './events/notification.events.js';

// Monitoring
import setupMetrics from './monitoring/metrics.js';
import { initSentry } from './monitoring/tracing.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        // Monitoring setup (best-effort — non-fatal)
        await initSentry();
        await setupMetrics();

        // Connect external services
        await connectDB();
        await connectRedis();
        configureCloudinary();

        // Create HTTP server and attach Socket.IO
        const httpServer = http.createServer(app);
        initSocket(httpServer);

        // Start listening
        httpServer.listen(PORT, () => {
            logger.info(`🚀 InfraLink server running on port ${PORT} [${process.env.NODE_ENV}]`);
            logger.info(`📖 API docs: http://localhost:${PORT}/api-docs`);
        });

        // Graceful shutdown
        const shutdown = async (signal) => {
            logger.info(`${signal} received. Shutting down gracefully...`);
            httpServer.close(() => {
                logger.info('HTTP server closed');
                process.exit(0);
            });
        };

        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));
    } catch (error) {
        logger.error(`Failed to start server: ${error.message}`);
        process.exit(1);
    }
};

startServer();
