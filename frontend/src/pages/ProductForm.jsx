import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { createProduct, updateProduct, getProductById } from '../services/api';
import { ArrowLeft } from 'lucide-react';
import ErrorMessage from '../components/ErrorMessage';

function ProductForm() {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    description: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);
  const [error, setError] = useState(null);

  const fetchProduct = useCallback(async () => {
    try {
      setInitialLoading(true);
      setError(null);
      const product = await getProductById(id);
      setFormData({
        name: product.name || '',
        category: product.category || '',
        price: product.price || '',
        description: product.description || ''
      });
    } catch (err) {
      console.error("Failed to load product for editing:", err);
      setError(err.message || "Failed to load product for editing.");
    } finally {
      setInitialLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (isEditing) {
      fetchProduct();
    }
  }, [isEditing, fetchProduct]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.category || !formData.price || !formData.description) {
      setError("Please fill in all fields.");
      return;
    }
    
    if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      setError("Price must be a valid positive number.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      if (isEditing) {
        await updateProduct(id, { ...formData, price: Number(formData.price) });
      } else {
        await createProduct({ ...formData, price: Number(formData.price) });
      }
      navigate('/admin');
    } catch (err) {
      setError(err.message || "Failed to save product.");
    } finally {
      setLoading(false);
    }
  };

  if (isEditing && initialLoading && !error && !formData.name) {
    return (
      <div className="form-page">
        <Link to="/admin" className="back-link">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading product details...</p>
        </div>
      </div>
    );
  }

  if (isEditing && error && !formData.name) {
    return (
      <div className="form-page">
        <Link to="/admin" className="back-link">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
        <ErrorMessage
          title="Unable to Load Product"
          message={error}
          onRetry={fetchProduct}
          isRetrying={initialLoading}
          action={
            <Link to="/admin" className="btn-secondary">
              Back to Dashboard
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="form-page">
      <Link to="/admin" className="back-link">
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>
      
      <div className="form-card">
        <h2>{isEditing ? 'Edit Product' : 'Add New Product'}</h2>
        
        {error && (
          <ErrorMessage 
            compact 
            message={error} 
            className="form-error-banner"
          />
        )}
        
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-group">
            <label>Product Name</label>
            <input 
              type="text" 
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Wireless Headphones"
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <input 
                type="text" 
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="e.g. Electronics"
              />
            </div>
            
            <div className="form-group">
              <label>Price ($)</label>
              <input 
                type="number"
                step="0.01" 
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="99.99"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>Description</label>
            <textarea 
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="5"
              placeholder="Product details..."
            ></textarea>
          </div>
          
          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Product'}
            </button>
            <Link to="/admin" className="btn-secondary">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProductForm;
