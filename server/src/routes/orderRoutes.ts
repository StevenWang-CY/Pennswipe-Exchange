import { Router } from 'express';
import * as orderController from '../controllers/orderController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/', authMiddleware, orderController.placeOrder);
router.get('/', orderController.getOrderBook);
router.get('/mine', authMiddleware, orderController.getUserOrders);
router.delete('/:id', authMiddleware, orderController.cancelOrder);

export default router;
