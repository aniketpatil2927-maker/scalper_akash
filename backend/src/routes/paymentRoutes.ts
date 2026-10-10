import { Router } from 'express';
import { createOrder, verifyPayment, getPaymentHistory } from '../controllers/paymentController';
import { authenticateJWT } from '../middlewares/auth';

const router = Router();

router.post('/payments/create-order', authenticateJWT, createOrder);
router.post('/orders/create', authenticateJWT, createOrder);
router.post('/orders', authenticateJWT, createOrder);
router.post('/payments/verify', authenticateJWT, verifyPayment);
router.get('/payments/history', authenticateJWT, getPaymentHistory);

export default router;
