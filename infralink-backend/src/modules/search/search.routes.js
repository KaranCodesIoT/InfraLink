import { Router } from 'express';
import { search } from './search.controller.js';

const router = Router();
// Public search endpoint
router.get('/', search);

export default router;
