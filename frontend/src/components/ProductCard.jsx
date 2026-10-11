import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';

function ProductCard({ product }) {
  if (!product) return null;

  const numReviews = Number(product.numReviews) || 0;
  const rawRating = Number(product.averageRating);
  const hasRating = !isNaN(rawRating) && numReviews > 0 && rawRating > 0;
  const formattedRating = hasRating ? rawRating.toFixed(1) : null;
  const formattedPrice = !isNaN(Number(product.price))
    ? Number(product.price).toFixed(2)
    : '0.00';

  const avatarInitial = product.name
    ? product.name.trim().charAt(0).toUpperCase()
    : '?';

  return (
    <article className="product-card" aria-labelledby={`product-title-${product._id}`}>
      <div className="product-card-image-placeholder" aria-hidden="true">
        <span>{avatarInitial}</span>
      </div>

      <div className="product-card-content">
        <div className="product-category">{product.category || 'General'}</div>
        <h3 id={`product-title-${product._id}`} className="product-title" title={product.name}>
          {product.name}
        </h3>
        <p className="product-description" title={product.description}>
          {product.description || 'No description provided.'}
        </p>

        <div className="product-meta">
          <div
            className="product-rating"
            aria-label={
              hasRating
                ? `Rated ${formattedRating} out of 5 stars from ${numReviews} ${
                    numReviews === 1 ? 'review' : 'reviews'
                  }`
                : 'No reviews yet'
            }
          >
            <Star
              size={16}
              fill={hasRating ? '#f59e0b' : 'none'}
              color={hasRating ? '#f59e0b' : '#9ca3af'}
              aria-hidden="true"
            />
            {hasRating ? (
              <>
                <span className="rating-value">{formattedRating}</span>
                <span className="review-count">
                  ({numReviews} {numReviews === 1 ? 'review' : 'reviews'})
                </span>
              </>
            ) : (
              <span className="no-rating-text">No reviews yet</span>
            )}
          </div>
          <div className="product-price">${formattedPrice}</div>
        </div>

        <Link
          to={`/products/${product._id}`}
          className="btn-secondary card-btn"
          aria-label={`View details for ${product.name}`}
        >
          View Details
        </Link>
      </div>
    </article>
  );
}

export default ProductCard;
