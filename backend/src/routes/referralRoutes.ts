import { Router } from 'express';
import { 
  getReferralDashboard, 
  getUserCommissions, 
  requestPayout, 
  getAdminReferralOverview, 
  getAdminAffiliates, 
  getAdminCommissions, 
  updateCommissionStatus, 
  getAdminPayouts, 
  processPayout, 
  getProgramConfig, 
  updateProgramConfig 
} from '../controllers/referralController';
import { authenticateJWT, requireRole } from '../middlewares/auth';

const router = Router();

// Client referral routes
router.get('/dashboard', authenticateJWT, getReferralDashboard);
router.get('/commissions', authenticateJWT, getUserCommissions);
router.post('/payout-request', authenticateJWT, requestPayout);

// Admin affiliate routes
router.get('/admin/overview', authenticateJWT, requireRole(['ADMIN', 'SUPER_ADMIN']), getAdminReferralOverview);
router.get('/admin/affiliates', authenticateJWT, requireRole(['ADMIN', 'SUPER_ADMIN']), getAdminAffiliates);
router.get('/admin/commissions', authenticateJWT, requireRole(['ADMIN', 'SUPER_ADMIN']), getAdminCommissions);
router.patch('/admin/commissions/:id', authenticateJWT, requireRole(['ADMIN', 'SUPER_ADMIN']), updateCommissionStatus);
router.get('/admin/payouts', authenticateJWT, requireRole(['ADMIN', 'SUPER_ADMIN']), getAdminPayouts);
router.patch('/admin/payouts/:id', authenticateJWT, requireRole(['ADMIN', 'SUPER_ADMIN']), processPayout);
router.get('/admin/program-config', authenticateJWT, requireRole(['ADMIN', 'SUPER_ADMIN']), getProgramConfig);
router.put('/admin/program-config', authenticateJWT, requireRole(['ADMIN', 'SUPER_ADMIN']), updateProgramConfig);

export default router;
