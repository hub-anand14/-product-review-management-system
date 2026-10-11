import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, ArrowLeft, Trash2, Edit } from 'lucide-react';
import { getProductById, getProductReviews, deleteReview } from '../services/api';
import ReviewForm from '../components/ReviewForm';
import ErrorMessage from '../components/ErrorMessage';

function ProductDetails({ user }) {
  const { id } = useParams();
  
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewsError, setReviewsError] = useState(null);
  
  // Review editing state
  const [editingReview, setEditingReview] = useState(null);

  const fetchProductData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const productData = await getProductById(id);
      setProduct(productData);
      
      try {
        setReviewsError(null);
        const reviewsData = await getProductReviews(id);
        setReviews(reviewsData || []);
      } catch (revErr) {
        console.error("Could not fetch reviews:", revErr);
        setReviewsError("Unable to load reviews right now.");
      }
    } catch (err) {
      console.error("Could not fetch product details:", err);
      setError(err.message || "Product not found or backend unavailable.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProductData();
  }, [fetchProductData]);

  const fetchReviewsOnly = async () => {
    try {
      setReviewsError(null);
      const reviewsData = await getProductReviews(id);
      setReviews(reviewsData || []);
    } catch (revErr) {
      console.error("Could not fetch reviews on retry:", revErr);
      setReviewsError("Unable to load reviews right now.");
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      try {
        await deleteReview(reviewId);
        fetchProductData(); // Refresh data
      } catch (err) {
        alert("Failed to delete review: " + err.message);
      }
    }
  };

  if (loading && !error && !product) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Loading details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-details-page">
        <Link to="/" className="back-link">
          <ArrowLeft size={16} /> Back to Products
        </Link>
        <ErrorMessage
          title="Unable to Load Product"
          message={error || "We couldn't find the product you're looking for or the server is unavailable."}
          onRetry={fetchProductData}
          isRetrying={loading}
          action={
            <Link to="/" className="btn-secondary">
              Back to Products
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="product-details-page">
      <Link to="/" className="back-link">
        <ArrowLeft size={16} /> Back to Products
      </Link>
      
      <div className="product-details-card">
        <div className="product-details-image">
          {product.name ? product.name.charAt(0) : '?'}
        </div>
        
        <div className="product-details-info">
          <div className="product-category">{product.category}</div>
          <h1>{product.name}</h1>
          
          <div className="product-meta-large">
            <div className="product-rating">
              <Star size={20} fill="#f59e0b" color="#f59e0b" />
              <span className="rating-value">{product.averageRating || 'New'}</span>
              <span className="review-count">({product.numReviews || 0} reviews)</span>
            </div>
            <div className="product-price-large">${Number(product.price).toFixed(2)}</div>
          </div>
          
          <p className="product-full-description">{product.description}</p>
        </div>
      </div>
      
      <div className="reviews-section">
        <h2>Customer Reviews</h2>
        
        {user ? (
          <ReviewForm 
            productId={id} 
            existingReview={editingReview} 
            onSuccess={() => {
              setEditingReview(null);
              fetchProductData();
            }}
            onCancel={() => setEditingReview(null)}
          />
        ) : (
          <div className="login-prompt">
            <p>Please <Link to="/login">login</Link> to leave a review.</p>
          </div>
        )}

        {reviewsError && (
          <ErrorMessage
            compact
            message={reviewsError}
            onRetry={fetchReviewsOnly}
            className="reviews-error-banner"
          />
        )}

        <div className="reviews-list">
          {reviews.length === 0 && !reviewsError ? (
            <p className="no-reviews">No reviews yet. Be the first to review this product!</p>
          ) : (
            reviews.map(review => {
              const isOwner = user && (review.user === user._id || (review.user && review.user._id === user._id));
              const reviewerName = review.user?.name || review.userName || 'Anonymous User';
              
              return (
                <div key={review._id} className="review-card">
                  <div className="review-header">
                    <div className="review-author">{reviewerName}</div>
                    <div className="review-stars">
                      {Array(5).fill(0).map((_, i) => (
                        <Star 
                          key={i} 
                          size={14} 
                          fill={i < review.rating ? "#f59e0b" : "none"} 
                          color={i < review.rating ? "#f59e0b" : "#d1d5db"} 
                        />
                      ))}
                    </div>
                  </div>
                  <p className="review-comment">{review.comment}</p>
                  
                  {isOwner && (
                    <div className="review-actions">
                      <button className="btn-text btn-small" onClick={() => setEditingReview(review)}>
                        <Edit size={14} /> Edit
                      </button>
                      <button className="btn-text btn-small text-danger" onClick={() => handleDeleteReview(review._id)}>
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;
