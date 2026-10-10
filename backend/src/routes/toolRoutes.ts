import { Router } from 'express';
import {
  calculate,
  saveCalculation,
  getSavedCalculations,
  deleteSavedCalculation,
} from '../controllers/toolController';
import { authenticate } from '../middlewares/auth';

const router = Router();

// Public calculation engine (instant client / guest access)
router.post('/calculate', calculate);

// Authenticated user saved simulations
router.post('/saved', authenticate, saveCalculation);
router.get('/saved', authenticate, getSavedCalculations);
router.delete('/saved/:id', authenticate, deleteSavedCalculation);

export default router;
