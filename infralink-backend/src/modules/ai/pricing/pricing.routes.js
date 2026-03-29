import { Router } from 'express';
import * as pricingCtrl from './pricing.controller.js';

const router = Router();

router.get('/recommend', pricingCtrl.getRecommendedPrice);

export default router;
