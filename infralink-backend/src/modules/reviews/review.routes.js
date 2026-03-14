import { Router } from 'express';
import * as reviewController from './review.controller.js';
import authMiddleware from '../../middleware/auth.middleware.js';
import validate from '../../middleware/validate.middleware.js';
import { createReviewSchema } from './review.validation.js';

const router = Router();
router.use(authMiddleware);

router.post('/', validate(createReviewSchema), reviewController.createReview);
router.get('/user/:userId', reviewController.getReviewsForUser);

export default router;
