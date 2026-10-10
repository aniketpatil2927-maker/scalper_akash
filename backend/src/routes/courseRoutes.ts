import { Router } from 'express';
import { 
  getCourses, 
  getCourseCategories, 
  getCourseBySlug, 
  enrollCourse, 
  getMyCourses, 
  getCourseProgress, 
  completeLesson, 
  verifyCertificate, 
  createCourseAdmin, 
  updateCourseAdmin, 
  deleteCourseAdmin, 
  getAdminCourseAnalytics 
} from '../controllers/courseController';
import { authenticateJWT, requireRole } from '../middlewares/auth';

const router = Router();

// Public course routes
router.get('/', getCourses);
router.get('/categories', getCourseCategories);
router.get('/certificates/:certificateId', verifyCertificate);
router.get('/my-courses', authenticateJWT, getMyCourses);
router.get('/:slug', getCourseBySlug);

// Client learning routes
router.post('/:id/enroll', authenticateJWT, enrollCourse);
router.get('/:id/progress', authenticateJWT, getCourseProgress);
router.post('/:id/lessons/:lessonId/complete', authenticateJWT, completeLesson);

// Admin course management routes
router.post('/admin/create', authenticateJWT, requireRole(['ADMIN', 'SUPER_ADMIN', 'TRADER']), createCourseAdmin);
router.put('/admin/:id', authenticateJWT, requireRole(['ADMIN', 'SUPER_ADMIN', 'TRADER']), updateCourseAdmin);
router.delete('/admin/:id', authenticateJWT, requireRole(['ADMIN', 'SUPER_ADMIN']), deleteCourseAdmin);
router.get('/admin/analytics', authenticateJWT, requireRole(['ADMIN', 'SUPER_ADMIN', 'TRADER']), getAdminCourseAnalytics);

export default router;
