import { Router } from 'express';
import { 
  getJournalEntries, 
  createJournalEntry, 
  updateJournalEntry, 
  deleteJournalEntry, 
  getAiWeeklyReview,
  bulkImportJournalEntries
} from '../controllers/journalController';
import { authenticateJWT } from '../middlewares/auth';

const router = Router();

router.get('/', authenticateJWT, getJournalEntries);
router.post('/', authenticateJWT, createJournalEntry);
router.post('/bulk-import', authenticateJWT, bulkImportJournalEntries);
router.get('/ai-review', authenticateJWT, getAiWeeklyReview);
router.put('/:id', authenticateJWT, updateJournalEntry);
router.delete('/:id', authenticateJWT, deleteJournalEntry);

export default router;
