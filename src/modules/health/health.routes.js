import { Router } from 'express';
import { healthCheck } from './health.controller.js';

const router = Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check
 *     tags: [Health]
 *     security: []
 */
router.get('/', healthCheck);

export default router;
