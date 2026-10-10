import { Router } from 'express';
import { getTraderScore } from '../controllers/traderScoreController';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.get('/trader-score', authenticate, getTraderScore);

export default router;
