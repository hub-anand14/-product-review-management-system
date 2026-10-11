import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product ID is required'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
      validate: {
        validator: Number.isInteger,
        message: 'Rating must be an integer between 1 and 5',
      },
    },
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      trim: true,
      minlength: [1, 'Review comment cannot be empty'],
      maxlength: [1000, 'Review comment cannot exceed 1000 characters'],
    },
  },
  {
    timestamps: true,
  }
);

reviewSchema.index({ productId: 1, user: 1 }, { unique: true });

reviewSchema.statics.calculateProductStats = async function (productId) {
  try {
    const objectId = typeof productId === 'string' ? new mongoose.Types.ObjectId(productId) : productId;
    const stats = await this.aggregate([
      { $match: { productId: objectId } },
      {
        $group: {
          _id: '$productId',
          numReviews: { $sum: 1 },
          averageRating: { $avg: '$rating' },
        },
      },
    ]);

    if (stats.length > 0) {
      await mongoose.model('Product').findByIdAndUpdate(productId, {
        numReviews: stats[0].numReviews,
        averageRating: Math.round(stats[0].averageRating * 10) / 10,
      });
    } else {
      await mongoose.model('Product').findByIdAndUpdate(productId, {
        numReviews: 0,
        averageRating: 0,
      });
    }
  } catch (error) {
    console.error(`[Review Stats Error] Failed to update product stats: ${error.message}`);
  }
};

reviewSchema.post('save', async function () {
  await this.constructor.calculateProductStats(this.productId);
});

const Review = mongoose.model('Review', reviewSchema);
export default Review;
