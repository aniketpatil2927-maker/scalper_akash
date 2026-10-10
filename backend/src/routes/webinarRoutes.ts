import { Router } from 'express';
import { 
  getWebinars, 
  getWebinarBySlug, 
  registerWebinar, 
  getMyWebinars, 
  createWebinarAdmin, 
  updateWebinarAdmin, 
  deleteWebinarAdmin, 
  attachRecordingAdmin, 
  getAdminWebinarAnalytics 
} from '../controllers/webinarController';
import { authenticateJWT, requireRole } from '../middlewares/auth';

const router = Router();

// Public webinar routes
router.get('/', getWebinars);
router.get('/my-webinars', authenticateJWT, getMyWebinars);
router.get('/:slug', getWebinarBySlug);

// Client registration
router.post('/:id/register', authenticateJWT, registerWebinar);

// Admin webinar management routes
router.post('/admin/create', authenticateJWT, requireRole(['ADMIN', 'SUPER_ADMIN', 'TRADER']), createWebinarAdmin);
router.put('/admin/:id', authenticateJWT, requireRole(['ADMIN', 'SUPER_ADMIN', 'TRADER']), updateWebinarAdmin);
router.delete('/admin/:id', authenticateJWT, requireRole(['ADMIN', 'SUPER_ADMIN']), deleteWebinarAdmin);
router.post('/admin/:id/recording', authenticateJWT, requireRole(['ADMIN', 'SUPER_ADMIN', 'TRADER']), attachRecordingAdmin);
router.get('/admin/analytics', authenticateJWT, requireRole(['ADMIN', 'SUPER_ADMIN', 'TRADER']), getAdminWebinarAnalytics);

export default router;
