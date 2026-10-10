import { Router } from 'express';
import { 
  getPlans, 
  getPlanById, 
  getSubscriptions, 
  getSubscriptionById, 
  createPlan, 
  updatePlan, 
  deletePlan,
  getAllPlansAdmin,
  togglePlanField
} from '../controllers/planController';
import { authenticateJWT, requirePermission } from '../middlewares/auth';

const router = Router();

// Public routes
router.get('/plans', getPlans);
router.get('/plans/:id', getPlanById);

// Authenticated client routes
router.get('/subscriptions', authenticateJWT, getSubscriptions);
router.get('/subscriptions/:id', authenticateJWT, getSubscriptionById);

// Admin-only plan management routes
router.get('/admin/plans', authenticateJWT, requirePermission('manage_plans'), getAllPlansAdmin);
router.post('/admin/plans', authenticateJWT, requirePermission('manage_plans'), createPlan);
router.put('/admin/plans/:id', authenticateJWT, requirePermission('manage_plans'), updatePlan);
router.patch('/admin/plans/:id/toggle', authenticateJWT, requirePermission('manage_plans'), togglePlanField);
router.delete('/admin/plans/:id', authenticateJWT, requirePermission('manage_plans'), deletePlan);

export default router;
