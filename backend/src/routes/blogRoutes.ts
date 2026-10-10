import { Router } from 'express';
import {
  getBlogPosts,
  getBlogPostBySlug,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  verifyCertificate,
} from '../controllers/blogController';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();

// Public routes
router.get('/posts', getBlogPosts);
router.get('/posts/:slug', getBlogPostBySlug);
router.get('/verify-certificate/:certificateId', verifyCertificate);

// Admin routes
router.post('/admin/posts', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), createBlogPost);
router.put('/admin/posts/:id', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), updateBlogPost);
router.delete('/admin/posts/:id', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), deleteBlogPost);

export default router;
