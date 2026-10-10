import { Router } from 'express';
import { getAnalyticsOverview, getAnalyticsCharts } from '../controllers/analyticsController';
import { authenticateJWT } from '../middlewares/auth';

const router = Router();

router.get('/overview', authenticateJWT, getAnalyticsOverview);
router.get('/charts', authenticateJWT, getAnalyticsCharts);

export default router;
