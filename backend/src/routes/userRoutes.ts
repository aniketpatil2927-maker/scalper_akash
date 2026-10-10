import { Router } from 'express';
import { 
  getProfile, 
  getNotifications, 
  markNotificationRead, 
  markAllNotificationsRead 
} from '../controllers/userController';
import { authenticateJWT } from '../middlewares/auth';

const router = Router();

router.get('/profile', authenticateJWT, getProfile);
router.get('/notifications', authenticateJWT, getNotifications);
router.put('/notifications/read-all', authenticateJWT, markAllNotificationsRead);
router.put('/notifications/:id/read', authenticateJWT, markNotificationRead);

export default router;
