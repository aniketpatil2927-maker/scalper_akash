import { Router } from 'express';
import {
  getMentors,
  getMentorById,
  bookSession,
  getMyBookings,
  getAllBookingsAdmin,
  updateBookingStatus,
  submitReview,
  createOrUpdateMentor,
} from '../controllers/mentorshipController';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();

// Public / Member routes
router.get('/mentors', getMentors);
router.get('/mentors/:id', getMentorById);
router.post('/book', authenticate, bookSession);
router.get('/my-bookings', authenticate, getMyBookings);
router.post('/bookings/:id/review', authenticate, submitReview);

// Admin routes
router.get('/admin/bookings', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), getAllBookingsAdmin);
router.patch('/admin/bookings/:id', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), updateBookingStatus);
router.post('/admin/mentors', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), createOrUpdateMentor);

export default router;
