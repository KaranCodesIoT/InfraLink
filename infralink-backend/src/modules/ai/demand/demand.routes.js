import { Router } from 'express';
import * as demandCtrl from './demand.controller.js';

const router = Router();

router.get('/trends', demandCtrl.getDemandTrends);

export default router;
