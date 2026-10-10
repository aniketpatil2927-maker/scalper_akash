import { Router } from 'express';
import {
  getAllVideos,
  getVideoById,
  recordVideoView,
  adminGetVideos,
  adminGetVideoStats,
  adminCreateVideo,
  adminUpdateVideo,
  adminDeleteVideo,
  adminUploadMedia,
  uploadMediaMiddleware,
} from '../controllers/videoController';
import { authenticateJWT, requireRole } from '../middlewares/auth';

const router = Router();

// Member / Public video catalog endpoints
router.get('/videos', getAllVideos);
router.get('/videos/:id', getVideoById);
router.post('/videos/:id/view', recordVideoView);

// Admin ERP Video Management endpoints
router.get('/admin/videos/stats', authenticateJWT, requireRole(['ADMIN', 'SUPER_ADMIN', 'TRADER']), adminGetVideoStats);
router.get('/admin/videos', authenticateJWT, requireRole(['ADMIN', 'SUPER_ADMIN', 'TRADER']), adminGetVideos);
router.post('/admin/videos', authenticateJWT, requireRole(['ADMIN', 'SUPER_ADMIN', 'TRADER']), adminCreateVideo);
router.post(
  '/admin/videos/upload-media',
  authenticateJWT,
  requireRole(['ADMIN', 'SUPER_ADMIN', 'TRADER']),
  uploadMediaMiddleware.single('file'),
  adminUploadMedia
);
router.put('/admin/videos/:id', authenticateJWT, requireRole(['ADMIN', 'SUPER_ADMIN', 'TRADER']), adminUpdateVideo);
router.delete('/admin/videos/:id', authenticateJWT, requireRole(['ADMIN', 'SUPER_ADMIN', 'TRADER']), adminDeleteVideo);


export default router;
