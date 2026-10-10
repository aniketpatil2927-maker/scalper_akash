import { Router } from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  checkoutProduct,
} from '../controllers/marketplaceController';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();

// Public / Member routes
router.get('/products', getProducts);
router.get('/products/:id', getProductById);
router.post('/checkout', authenticate, checkoutProduct);

// Admin routes
router.post('/admin/products', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), createProduct);
router.put('/admin/products/:id', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), updateProduct);
router.delete('/admin/products/:id', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), deleteProduct);

export default router;
