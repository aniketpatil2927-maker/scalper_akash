import { Router } from 'express';
import {
  getMyStrategies,
  getPublicStrategies,
  createStrategy,
  updateStrategy,
  deleteStrategy,
  runBacktest,
  getStrategyBacktests,
} from '../controllers/strategyController';
import { authenticate } from '../middlewares/auth';

const router = Router();

// Public Strategy Library
router.get('/library', getPublicStrategies);

// User Strategies
router.get('/', authenticate, getMyStrategies);
router.post('/', authenticate, createStrategy);
router.put('/:id', authenticate, updateStrategy);
router.delete('/:id', authenticate, deleteStrategy);

// Backtesting Engine
router.post('/:strategyId/backtest', authenticate, runBacktest);
router.get('/:strategyId/backtests', authenticate, getStrategyBacktests);

export default router;
