import { Router } from 'express';
import { getAdminRevenueAnalytics } from '../controllers/revenueController';
import { authenticateJWT, requireRole } from '../middlewares/auth';

const router = Router();

router.get('/admin/analytics', authenticateJWT, requireRole(['ADMIN', 'SUPER_ADMIN']), getAdminRevenueAnalytics);

export default router;
