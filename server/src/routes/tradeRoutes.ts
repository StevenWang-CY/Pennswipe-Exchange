import { Router } from 'express';
import * as tradeController from '../controllers/tradeController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', tradeController.getTrades);
router.get('/mine', authMiddleware, tradeController.getUserTrades);

export default router;
