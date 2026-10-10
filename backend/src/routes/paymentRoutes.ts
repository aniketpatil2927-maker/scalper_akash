import { Router } from 'express';
import { createOrder, verifyPayment, getPaymentHistory, getAllOrders } from '../controllers/paymentController';
import { authenticateJWT, requireRole } from '../middlewares/auth';

const router = Router();

router.post('/payments/create-order', authenticateJWT, createOrder);
router.post('/orders/create', authenticateJWT, createOrder);
router.post('/orders', authenticateJWT, createOrder);
router.post('/payments/verify', authenticateJWT, verifyPayment);
router.get('/payments/history', authenticateJWT, getPaymentHistory);
router.get('/admin/orders', authenticateJWT, requireRole(['ADMIN', 'SUPER_ADMIN']), getAllOrders);

export default router;
