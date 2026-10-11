import express from 'express';
import { getProductReviews, createReview } from '../controllers/reviewController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

// mergeParams: true allows access to :productId from the parent route
const router = express.Router({ mergeParams: true });

router.route('/')
  .get(getProductReviews)
  .post(authenticateUser, createReview);

export default router;
