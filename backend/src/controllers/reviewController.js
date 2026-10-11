import mongoose from 'mongoose';
import Review from '../models/Review.js';
import Product from '../models/Product.js';

/**
 * @desc    Get all reviews for a specific product
 * @route   GET /api/products/:productId/reviews
 * @access  Public
 */
export const getProductReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const reviews = await Review.find({ productId })
      .populate('user', '_id name email')
      .sort({ createdAt: -1 });

    return res.status(200).json(reviews);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new review for a product
 * @route   POST /api/products/:productId/reviews
 * @access  Private
 */
export const createReview = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { rating, comment } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if the authenticated user has already reviewed this product
    const alreadyReviewed = await Review.findOne({
      productId,
      user: req.user._id,
    });

    if (alreadyReviewed) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    // Validate rating
    const numericRating = Number(rating);
    if (
      rating === undefined ||
      isNaN(numericRating) ||
      !Number.isInteger(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      return res.status(400).json({ message: 'Rating must be an integer between 1 and 5' });
    }

    // Validate comment
    if (!comment || typeof comment !== 'string' || comment.trim().length === 0) {
      return res.status(400).json({ message: 'Review comment cannot be empty' });
    }

    const trimmedComment = comment.trim();
    if (trimmedComment.length > 1000) {
      return res.status(400).json({ message: 'Review comment cannot exceed 1000 characters' });
    }

    // Set user from authenticated JWT session, never from body
    const review = await Review.create({
      productId,
      user: req.user._id,
      rating: numericRating,
      comment: trimmedComment,
    });

    // Recalculate and persist average rating and review count on product
    await Review.calculateProductStats(productId);

    // Populate user info for frontend display
    await review.populate('user', '_id name email');

    return res.status(201).json(review);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a review
 * @route   PUT /api/reviews/:reviewId
 * @access  Private (Owner only)
 */
export const updateReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;

    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({ message: 'Invalid review ID' });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Ensure only review owner can edit
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this review' });
    }

    if (rating !== undefined) {
      const numericRating = Number(rating);
      if (
        isNaN(numericRating) ||
        !Number.isInteger(numericRating) ||
        numericRating < 1 ||
        numericRating > 5
      ) {
        return res.status(400).json({ message: 'Rating must be an integer between 1 and 5' });
      }
      review.rating = numericRating;
    }

    if (comment !== undefined) {
      if (typeof comment !== 'string' || comment.trim().length === 0) {
        return res.status(400).json({ message: 'Review comment cannot be empty' });
      }
      const trimmedComment = comment.trim();
      if (trimmedComment.length > 1000) {
        return res.status(400).json({ message: 'Review comment cannot exceed 1000 characters' });
      }
      review.comment = trimmedComment;
    }

    await review.save();

    // Recalculate product rating and count
    await Review.calculateProductStats(review.productId);

    await review.populate('user', '_id name email');

    return res.status(200).json(review);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a review
 * @route   DELETE /api/reviews/:reviewId
 * @access  Private (Owner only)
 */
export const deleteReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({ message: 'Invalid review ID' });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Ensure only review owner can delete
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    const productId = review.productId;
    await review.deleteOne();

    // Recalculate product rating and count
    await Review.calculateProductStats(productId);

    return res.status(200).json({ message: 'Review deleted successfully' });
  } catch (error) {
    next(error);
  }
};
