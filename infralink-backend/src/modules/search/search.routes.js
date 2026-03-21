import { Router } from 'express';
import { search } from './search.controller.js';
import { optionalAuth } from '../../middleware/auth.middleware.js';

const router = Router();
// Public search endpoint with optional auth context
router.get('/', optionalAuth, search);

export default router;
