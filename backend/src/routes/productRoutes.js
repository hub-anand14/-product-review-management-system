import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';
import productReviewRoutes from './productReviewRoutes.js';
import { authenticateUser, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Forward review routes for a product: /api/products/:productId/reviews
router.use('/:productId/reviews', productReviewRoutes);

router.route('/')
  .get(getProducts)
  .post(authenticateUser, requireAdmin, createProduct);

router.route('/:id')
  .get(getProductById)
  .put(authenticateUser, requireAdmin, updateProduct)
  .delete(authenticateUser, requireAdmin, deleteProduct);

export default router;
