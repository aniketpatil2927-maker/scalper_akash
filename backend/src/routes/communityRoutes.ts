import { Router } from 'express';
import {
  getPosts,
  getPostById,
  createPost,
  toggleLike,
  addComment,
  adminModeratePost,
  deletePost,
} from '../controllers/communityController';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();

// Member / Community routes
router.get('/posts', getPosts);
router.get('/posts/:id', getPostById);
router.post('/posts', authenticate, createPost);
router.post('/posts/:id/like', authenticate, toggleLike);
router.post('/posts/:id/comments', authenticate, addComment);

// Admin Moderation routes
router.patch('/admin/posts/:id/moderate', authenticate, authorize(['ADMIN', 'SUPER_ADMIN', 'SUPPORT']), adminModeratePost);
router.delete('/admin/posts/:id', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), deletePost);

export default router;
