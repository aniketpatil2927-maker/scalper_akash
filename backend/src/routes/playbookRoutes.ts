import { Router } from 'express';
import {
  getPlaybooks,
  getPlaybookBySlug,
  getAllPlaybooksAdmin,
  createPlaybook,
  updatePlaybook,
  deletePlaybook,
  likePlaybook,
} from '../controllers/playbookController';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();

// Public / Member routes
router.get('/', getPlaybooks);
router.get('/slug/:slug', getPlaybookBySlug);
router.post('/:id/like', likePlaybook);

// Admin routes
router.get('/admin/all', authenticate, authorize(['ADMIN', 'SUPER_ADMIN', 'TRADER']), getAllPlaybooksAdmin);
router.post('/admin/create', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), createPlaybook);
router.put('/admin/:id', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), updatePlaybook);
router.delete('/admin/:id', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), deletePlaybook);

export default router;
