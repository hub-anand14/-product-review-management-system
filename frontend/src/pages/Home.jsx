import { useState, useEffect, useCallback } from 'react';
import { Search, RefreshCw, AlertCircle, RotateCcw, PackageOpen, SearchX } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { getProducts } from '../services/api';

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter and Sort states
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState('');

  // Fetch products from backend API
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err?.message || 'Could not load products. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Handle retry with debouncing guard against rapid duplicate clicks
  const handleRetry = async () => {
    if (loading) return;
    await fetchProducts();
  };

  // Get unique categories sorted alphabetically
  const categories = [...new Set(products.map((p) => p.category).filter(Boolean))].sort();

  // Apply search, category filter, and sorting
  const trimmedSearch = searchTerm.trim().toLowerCase();
  const filteredProducts = products.filter((product) => {
    const nameMatch = product.name?.toLowerCase().includes(trimmedSearch);
    const descMatch = product.description?.toLowerCase().includes(trimmedSearch);
    const matchesSearch = !trimmedSearch || nameMatch || descMatch;
    const matchesCategory = categoryFilter === '' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (sortBy === 'price-low') {
    filteredProducts.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
  } else if (sortBy === 'price-high') {
    filteredProducts.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
  } else if (sortBy === 'rating') {
    filteredProducts.sort((a, b) => (Number(b.averageRating) || 0) - (Number(a.averageRating) || 0));
  }

  const hasActiveFilters = Boolean(searchTerm || categoryFilter || sortBy);

  const resetFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
    setSortBy('');
  };

  return (
    <div className="home-page">
      <header className="hero-section">
        <h1>Discover Top Products</h1>
        <p>Read real reviews from real users before you buy.</p>
      </header>

      {/* Controls: Search, Category Filter, and Sorting */}
      <section className="controls-section" aria-label="Product search and filters">
        <div className="search-box">
          <Search size={20} className="search-icon" aria-hidden="true" />
          <input
            type="search"
            placeholder="Search by product name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
            aria-label="Search products"
            disabled={loading && products.length === 0}
          />
        </div>

        <div className="filters-box">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="select-input"
            aria-label="Filter by category"
            disabled={loading && products.length === 0}
          >
            <option value="">All Categories ({products.length})</option>
            {categories.map((cat) => {
              const count = products.filter((p) => p.category === cat).length;
              return (
                <option key={cat} value={cat}>
                  {cat} ({count})
                </option>
              );
            })}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="select-input"
            aria-label="Sort products"
            disabled={loading && products.length === 0}
          >
            <option value="">Sort By: Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="btn-text btn-reset"
              aria-label="Reset all search filters"
            >
              <RotateCcw size={14} aria-hidden="true" /> Reset Filters
            </button>
          )}
        </div>
      </section>

      {/* Active Filter Results Counter */}
      {!loading && !error && products.length > 0 && (
        <div className="results-info" aria-live="polite">
          <span>
            Showing <strong>{filteredProducts.length}</strong> of <strong>{products.length}</strong>{' '}
            {products.length === 1 ? 'product' : 'products'}
            {hasActiveFilters && ' (filtered)'}
          </span>
        </div>
      )}

      {/* Primary Content States */}
      {loading ? (
        /* Accessible Skeleton Loading State */
        <div className="loading-state-container" role="status" aria-live="polite">
          <div className="loading-header">
            <div className="spinner" aria-hidden="true"></div>
            <p>Loading products catalog...</p>
          </div>
          <div className="product-grid" aria-hidden="true">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="skeleton-card">
                <div className="skeleton-image"></div>
                <div className="skeleton-content">
                  <div className="skeleton-line skeleton-category"></div>
                  <div className="skeleton-line skeleton-title"></div>
                  <div className="skeleton-line skeleton-desc"></div>
                  <div className="skeleton-line skeleton-desc-short"></div>
                  <div className="skeleton-meta">
                    <div className="skeleton-line skeleton-rating"></div>
                    <div className="skeleton-line skeleton-price"></div>
                  </div>
                  <div className="skeleton-btn"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : error ? (
        /* API Failure State with Retry Button */
        <div className="error-state" role="alert">
          <AlertCircle size={44} className="error-icon" aria-hidden="true" />
          <h3>Unable to Load Products</h3>
          <p>{error}</p>
          <button
            type="button"
            onClick={handleRetry}
            className="btn-primary btn-retry"
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? 'spin' : ''} aria-hidden="true" />
            {loading ? 'Retrying...' : 'Retry'}
          </button>
        </div>
      ) : products.length === 0 ? (
        /* API Succeeded but Database Has Zero Products */
        <div className="empty-state" role="status">
          <PackageOpen size={48} className="empty-icon" aria-hidden="true" />
          <h3>No Products Available</h3>
          <p>The product catalog is currently empty. Please check back later.</p>
          <button
            type="button"
            onClick={handleRetry}
            className="btn-secondary"
            disabled={loading}
          >
            <RefreshCw size={16} aria-hidden="true" /> Refresh Catalog
          </button>
        </div>
      ) : filteredProducts.length === 0 ? (
        /* Products Exist, but Filters Produced Zero Results */
        <div className="empty-state" role="status">
          <SearchX size={48} className="empty-icon" aria-hidden="true" />
          <h3>No Matching Products Found</h3>
          <p>
            No products matched your search
            {trimmedSearch ? ` "${searchTerm}"` : ''}
            {categoryFilter ? ` in category "${categoryFilter}"` : ''}.
          </p>
          <button type="button" onClick={resetFilters} className="btn-secondary">
            <RotateCcw size={16} aria-hidden="true" /> Reset Filters
          </button>
        </div>
      ) : (
        /* Product Grid */
        <div className="product-grid">
          {filteredProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;
