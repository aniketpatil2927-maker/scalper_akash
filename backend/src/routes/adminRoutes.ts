import { Router } from 'express';
import { 
  getDashboardKPIs, 
  getUsers, 
  getUserDetail, 
  updateUserStatus, 
  manuallyAssignPlan, 
  manuallyAdjustCredits,
  getAuditLogs,
  broadcastAnnouncement
} from '../controllers/adminController';
import { authenticateJWT, requirePermission } from '../middlewares/auth';

const router = Router();

// Protect all admin routes using JWT verification and specific permission requirements
router.get('/admin/dashboard', authenticateJWT, requirePermission('view_reports'), getDashboardKPIs);
router.get('/admin/users', authenticateJWT, requirePermission('manage_users'), getUsers);
router.get('/admin/users/:id', authenticateJWT, requirePermission('manage_users'), getUserDetail);
router.put('/admin/users/:id/status', authenticateJWT, requirePermission('manage_users'), updateUserStatus);
router.post('/admin/users/:id/assign-plan', authenticateJWT, requirePermission('manage_payments'), manuallyAssignPlan);
router.post('/admin/users/:id/adjust-credits', authenticateJWT, requirePermission('manage_payments'), manuallyAdjustCredits);
router.get('/admin/audit-logs', authenticateJWT, requirePermission('view_audit_logs'), getAuditLogs);
router.post('/admin/broadcast', authenticateJWT, requirePermission('manage_users'), broadcastAnnouncement);

export default router;
