import express from 'express';
import { updateReview, deleteReview } from '../controllers/reviewController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/:reviewId')
  .put(authenticateUser, updateReview)
  .delete(authenticateUser, deleteReview);

export default router;
