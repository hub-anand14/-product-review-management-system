import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { createReview, updateReview } from '../services/api';

function ReviewForm({ productId, existingReview, onSuccess, onCancel }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating);
      setComment(existingReview.comment);
    } else {
      setRating(5);
      setComment('');
    }
  }, [existingReview]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError("Please write a comment.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      if (existingReview) {
        await updateReview(existingReview._id, { rating, comment });
      } else {
        await createReview(productId, { rating, comment });
      }
      setRating(5);
      setComment('');
      onSuccess();
    } catch (err) {
      setError(err.message || "Failed to submit review.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="review-form-container">
      <h3>{existingReview ? 'Edit Your Review' : 'Write a Review'}</h3>
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="review-form">
        <div className="rating-select">
          <label>Rating:</label>
          <div className="stars-input">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="star-btn"
                onClick={() => setRating(star)}
              >
                <Star 
                  size={24} 
                  fill={star <= rating ? "#f59e0b" : "none"} 
                  color={star <= rating ? "#f59e0b" : "#d1d5db"} 
                />
              </button>
            ))}
          </div>
        </div>
        
        <div className="form-group">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="What do you think about this product?"
            rows="4"
          ></textarea>
        </div>
        
        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Review'}
          </button>
          {existingReview && (
            <button type="button" className="btn-secondary" onClick={onCancel} disabled={loading}>
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default ReviewForm;
