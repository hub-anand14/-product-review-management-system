import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';

function ProductCard({ product }) {
  return (
    <div className="product-card">
      <div className="product-card-image-placeholder">
        <span>{product.name ? product.name.charAt(0) : '?'}</span>
      </div>
      
      <div className="product-card-content">
        <div className="product-category">{product.category}</div>
        <h3 className="product-title">{product.name}</h3>
        <p className="product-description">{product.description?.substring(0, 80)}...</p>
        
        <div className="product-meta">
          <div className="product-rating">
            <Star size={16} fill="#f59e0b" color="#f59e0b" />
            <span className="rating-value">{product.averageRating || 'New'}</span>
            <span className="review-count">({product.numReviews || 0} reviews)</span>
          </div>
          <div className="product-price">${Number(product.price).toFixed(2)}</div>
        </div>
        
        <Link to={`/products/${product._id}`} className="btn-secondary card-btn">
          View Details
        </Link>
      </div>
    </div>
  );
}

export default ProductCard;
