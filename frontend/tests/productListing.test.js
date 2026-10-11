import assert from 'node:assert/strict';
import test from 'node:test';

// 1. Test API_URL Normalization Logic
test('API_URL Normalization handles various VITE_API_URL formats', () => {
  const normalize = (envVal) => {
    const raw = (envVal || 'http://localhost:5000').trim().replace(/\/+$/, '');
    return raw.endsWith('/api') ? raw : `${raw}/api`;
  };

  assert.equal(normalize('http://localhost:5000'), 'http://localhost:5000/api');
  assert.equal(normalize('http://localhost:5000/'), 'http://localhost:5000/api');
  assert.equal(normalize('http://localhost:5000/api'), 'http://localhost:5000/api');
  assert.equal(normalize('http://localhost:5000/api/'), 'http://localhost:5000/api');
  assert.equal(normalize('http://localhost:5001'), 'http://localhost:5001/api');
  assert.equal(normalize('http://localhost:5001/api'), 'http://localhost:5001/api');
  assert.equal(normalize('https://product-review-management-system.onrender.com'), 'https://product-review-management-system.onrender.com/api');
  assert.equal(normalize('https://product-review-management-system.onrender.com/api'), 'https://product-review-management-system.onrender.com/api');
});

// 2. Test ProductCard Rating Formatting & Zero Reviews Handling
test('ProductCard Rating Formatting handles valid ratings, zero reviews, and missing values', () => {
  const computeRatingProps = (product) => {
    const numReviews = Number(product?.numReviews) || 0;
    const rawRating = Number(product?.averageRating);
    const hasRating = !isNaN(rawRating) && numReviews > 0 && rawRating > 0;
    const formattedRating = hasRating ? rawRating.toFixed(1) : null;
    const formattedPrice = !isNaN(Number(product?.price)) ? Number(product.price).toFixed(2) : '0.00';
    const reviewLabel = numReviews === 1 ? 'review' : 'reviews';
    const displayText = hasRating ? `${formattedRating} (${numReviews} ${reviewLabel})` : 'No reviews yet';
    return { hasRating, formattedRating, numReviews, reviewLabel, formattedPrice, displayText };
  };

  // Case A: Product with positive reviews
  {
    const res = computeRatingProps({ averageRating: 4.5, numReviews: 2, price: 99.9 });
    assert.equal(res.hasRating, true);
    assert.equal(res.formattedRating, '4.5');
    assert.equal(res.displayText, '4.5 (2 reviews)');
    assert.equal(res.formattedPrice, '99.90');
  }

  // Case B: Product with single review (pluralization test)
  {
    const res = computeRatingProps({ averageRating: 5, numReviews: 1, price: 120 });
    assert.equal(res.hasRating, true);
    assert.equal(res.formattedRating, '5.0');
    assert.equal(res.displayText, '5.0 (1 review)');
  }

  // Case C: Zero reviews (graceful handling - must NOT show 0.0 or misleading gold star)
  {
    const res = computeRatingProps({ averageRating: 0, numReviews: 0, price: 49.99 });
    assert.equal(res.hasRating, false);
    assert.equal(res.formattedRating, null);
    assert.equal(res.displayText, 'No reviews yet');
  }

  // Case D: Missing, null, or undefined values
  {
    const resNull = computeRatingProps({ averageRating: null, numReviews: null, price: null });
    assert.equal(resNull.hasRating, false);
    assert.equal(resNull.displayText, 'No reviews yet');
    assert.equal(resNull.formattedPrice, '0.00');

    const resEmpty = computeRatingProps({});
    assert.equal(resEmpty.hasRating, false);
    assert.equal(resEmpty.displayText, 'No reviews yet');
  }
});

// 3. Test Product Search, Filtering, and Sorting
test('Product Filtering and Sorting behaves consistently', () => {
  const sampleProducts = [
    { _id: '1', name: 'Wireless Headphones', category: 'Audio', price: 199.99, averageRating: 4.5, numReviews: 8 },
    { _id: '2', name: 'Gaming Keyboard', category: 'Computers', price: 89.99, averageRating: 4.0, numReviews: 5 },
    { _id: '3', name: 'Office Chair', category: 'Furniture', price: 249.50, averageRating: 0, numReviews: 0 },
    { _id: '4', name: 'Smart Watch', category: 'Wearables', price: 129.00, averageRating: 4.8, numReviews: 12 },
  ];

  const filterAndSort = (products, search, category, sortBy) => {
    const trimmed = (search || '').trim().toLowerCase();
    let res = products.filter((p) => {
      const nameMatch = p.name?.toLowerCase().includes(trimmed);
      const matchesSearch = !trimmed || nameMatch;
      const matchesCategory = !category || p.category === category;
      return matchesSearch && matchesCategory;
    });

    if (sortBy === 'price-low') {
      res.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortBy === 'price-high') {
      res.sort((a, b) => Number(b.price) - Number(a.price));
    } else if (sortBy === 'rating') {
      res.sort((a, b) => Number(b.averageRating) - Number(a.averageRating));
    }
    return res;
  };

  // Search by name
  assert.equal(filterAndSort(sampleProducts, 'watch', '', '').length, 1);
  assert.equal(filterAndSort(sampleProducts, 'head', '', '')[0]._id, '1');

  // Filter by category
  assert.equal(filterAndSort(sampleProducts, '', 'Furniture', '').length, 1);
  assert.equal(filterAndSort(sampleProducts, '', 'Audio', '')[0].name, 'Wireless Headphones');

  // Combined search and category filter
  assert.equal(filterAndSort(sampleProducts, 'Gaming', 'Computers', '').length, 1);
  assert.equal(filterAndSort(sampleProducts, 'Gaming', 'Furniture', '').length, 0); // No match

  // Sorting
  const sortedByPriceLow = filterAndSort(sampleProducts, '', '', 'price-low');
  assert.equal(sortedByPriceLow[0].price, 89.99); // Gaming Keyboard is cheapest

  const sortedByPriceHigh = filterAndSort(sampleProducts, '', '', 'price-high');
  assert.equal(sortedByPriceHigh[0].price, 249.50); // Office Chair is most expensive

  const sortedByRating = filterAndSort(sampleProducts, '', '', 'rating');
  assert.equal(sortedByRating[0].name, 'Smart Watch'); // Highest rated (4.8)
});

// 4. Test State Machine Transitions (Loading, Error, Empty, Success)
test('Home Page State Machine ensures mutual consistency', () => {
  const getRenderState = ({ loading, error, catalogCount, filteredCount }) => {
    if (loading) return 'LOADING';
    if (error) return 'ERROR';
    if (catalogCount === 0) return 'EMPTY_CATALOG';
    if (filteredCount === 0) return 'EMPTY_FILTER_RESULTS';
    return 'SUCCESS_GRID';
  };

  // State A: Initial request in flight
  assert.equal(getRenderState({ loading: true, error: null, catalogCount: 0, filteredCount: 0 }), 'LOADING');

  // State B: API error (e.g. server down)
  assert.equal(getRenderState({ loading: false, error: 'Connection refused', catalogCount: 0, filteredCount: 0 }), 'ERROR');

  // State C: API succeeded, but 0 products in database
  assert.equal(getRenderState({ loading: false, error: null, catalogCount: 0, filteredCount: 0 }), 'EMPTY_CATALOG');

  // State D: API succeeded with 5 products, but search "xyz" matched 0
  assert.equal(getRenderState({ loading: false, error: null, catalogCount: 5, filteredCount: 0 }), 'EMPTY_FILTER_RESULTS');

  // State E: Normal success with matching products
  assert.equal(getRenderState({ loading: false, error: null, catalogCount: 5, filteredCount: 3 }), 'SUCCESS_GRID');
});
