import { Router } from 'express';
import { 
  getMyTrades, 
  getMyTradeById, 
  getTraderTrades, 
  createTrade, 
  publishTrade, 
  updateTrade, 
  closeTrade,
  getEligibleSubscribers,
  broadcastTradeUpdate,
  getPublicTradesSummary
} from '../controllers/tradeController';
import { authenticateJWT, requirePermission } from '../middlewares/auth';

const router = Router();

// Public summary for landing page
router.get('/trades/public', getPublicTradesSummary);

// Client routes (User must be logged in, details are filtered based on their subscriptions)
router.get('/trades', authenticateJWT, getMyTrades);
router.get('/trades/:id', authenticateJWT, getMyTradeById);

// Trader/Admin management routes
router.get('/trader/trades', authenticateJWT, requirePermission('manage_trades'), getTraderTrades);
router.get('/trader/trades/:id/subscribers', authenticateJWT, requirePermission('manage_trades'), getEligibleSubscribers);
router.post('/trader/trades', authenticateJWT, requirePermission('manage_trades'), createTrade);
router.post('/trader/trades/:id/publish', authenticateJWT, requirePermission('manage_trades'), publishTrade);
router.post('/trader/trades/:id/broadcast', authenticateJWT, requirePermission('manage_trades'), broadcastTradeUpdate);
router.put('/trader/trades/:id', authenticateJWT, requirePermission('manage_trades'), updateTrade);
router.post('/trader/trades/:id/close', authenticateJWT, requirePermission('manage_trades'), closeTrade);

export default router;
