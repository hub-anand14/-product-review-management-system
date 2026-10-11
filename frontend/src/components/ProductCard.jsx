import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';

function ProductCard({ product }) {
  const initial = product.name ? product.name.charAt(0).toUpperCase() : '?';
  const rating = product.averageRating ? Number(product.averageRating).toFixed(1) : 'New';
  const reviewCount = product.numReviews || 0;
  const priceFormatted = Number(product.price || 0).toFixed(2);

  return (
    <div className="product-card">
      <div className="product-card-image-placeholder">
        <span className="product-card-image-initial">{initial}</span>
      </div>
      
      <div className="product-card-content">
        <div className="product-category">{product.category}</div>
        
        <div className="product-header-row">
          <h3 className="product-title" title={product.name}>{product.name}</h3>
          <div className="product-price">${priceFormatted}</div>
        </div>
        
        <p className="product-description">{product.description?.substring(0, 85)}...</p>
        
        <div className="product-meta">
          <div className="product-rating">
            <Star size={16} fill="#f59e0b" color="#f59e0b" />
            <span className="rating-value">{rating}</span>
            <span className="review-count">({reviewCount} reviews)</span>
          </div>
        </div>
        
        <Link to={`/products/${product._id}`} className="btn-secondary card-btn">
          View Details
        </Link>
      </div>
    </div>
  );
}

export default ProductCard;
