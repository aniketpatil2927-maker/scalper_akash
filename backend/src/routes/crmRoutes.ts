import { Router } from 'express';
import {
  getLeads,
  createLead,
  updateLeadStage,
  updateLead,
  deleteLead,
  getCrmStats,
} from '../controllers/crmController';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();

router.use(authenticate, authorize(['ADMIN', 'SUPER_ADMIN']));

router.get('/leads', getLeads);
router.post('/leads', createLead);
router.patch('/leads/:id/stage', updateLeadStage);
router.put('/leads/:id', updateLead);
router.delete('/leads/:id', deleteLead);
router.get('/stats', getCrmStats);

export default router;
