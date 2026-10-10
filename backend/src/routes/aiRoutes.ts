import { Router } from 'express';
import { 
  getConversations, 
  createConversation, 
  getConversationById, 
  deleteConversation, 
  sendMessage, 
  getAiUsage,
  getAdminAiStats 
} from '../controllers/aiController';
import { authenticateJWT, requireRole } from '../middlewares/auth';

const router = Router();

// Client routes
router.get('/conversations', authenticateJWT, getConversations);
router.post('/conversations', authenticateJWT, createConversation);
router.get('/conversations/:id', authenticateJWT, getConversationById);
router.post('/conversations/:id/messages', authenticateJWT, sendMessage);
router.delete('/conversations/:id', authenticateJWT, deleteConversation);
router.get('/usage', authenticateJWT, getAiUsage);

// Admin routes
router.get('/admin/stats', authenticateJWT, requireRole(['ADMIN', 'SUPER_ADMIN']), getAdminAiStats);

export default router;
