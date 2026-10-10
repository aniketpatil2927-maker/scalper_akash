import { Router } from 'express';
import {
  getTelegramConfig,
  saveTelegramConfig,
  testTelegramConnection,
  createTelegramPost,
  getTelegramPosts,
  deleteTelegramPost,
  getPublicTelegramFeed,
  getSubscriberTelegramFeed,
} from '../controllers/telegramController';
import { authenticateJWT, requireRole } from '../middlewares/auth';

const router = Router();

// Public & Subscriber Feeds
router.get('/telegram/public-feed', getPublicTelegramFeed);
router.get('/telegram/subscriber-feed', authenticateJWT, getSubscriberTelegramFeed);

// Admin & Trader Telegram Management Routes
router.get('/admin/telegram/config', authenticateJWT, requireRole(['ADMIN', 'SUPER_ADMIN', 'TRADER']), getTelegramConfig);
router.post('/admin/telegram/config', authenticateJWT, requireRole(['ADMIN', 'SUPER_ADMIN', 'TRADER']), saveTelegramConfig);
router.post('/admin/telegram/test', authenticateJWT, requireRole(['ADMIN', 'SUPER_ADMIN', 'TRADER']), testTelegramConnection);
router.post('/admin/telegram/post', authenticateJWT, requireRole(['ADMIN', 'SUPER_ADMIN', 'TRADER']), createTelegramPost);
router.get('/admin/telegram/posts', authenticateJWT, requireRole(['ADMIN', 'SUPER_ADMIN', 'TRADER']), getTelegramPosts);
router.delete('/admin/telegram/posts/:id', authenticateJWT, requireRole(['ADMIN', 'SUPER_ADMIN', 'TRADER']), deleteTelegramPost);

export default router;
