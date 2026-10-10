import { Router } from 'express';
import { validateCoupon, getAdminCoupons, createAdminCoupon, updateAdminCoupon } from '../controllers/couponController';
import { authenticateJWT, requireRole } from '../middlewares/auth';

const router = Router();

router.post('/validate', authenticateJWT, validateCoupon);
router.get('/admin', authenticateJWT, requireRole(['ADMIN', 'SUPER_ADMIN']), getAdminCoupons);
router.post('/admin', authenticateJWT, requireRole(['ADMIN', 'SUPER_ADMIN']), createAdminCoupon);
router.put('/admin/:id', authenticateJWT, requireRole(['ADMIN', 'SUPER_ADMIN']), updateAdminCoupon);

export default router;
