const rawApiUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || 'http://localhost:5000';
const API_URL = rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl}/api`;

/**
 * Format errors into human-friendly explanations.
 */
function formatErrorMessage(err, fallback = 'Operation failed. Please try again.') {
  if (err?.name === 'TypeError' || err?.message?.includes('fetch') || err?.message?.includes('NetworkError')) {
    return 'Unable to connect to the server. Please check your internet connection or verify the service is running.';
  }
  return err?.message || fallback;
}

// Helper for making requests with authentication
async function fetchWithAuth(url, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }
    return await response.json();
  } catch (err) {
    throw new Error(formatErrorMessage(err, 'Operation failed.'));
  }
}

// --- Auth ---
export async function login(credentials) {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Login failed. Please check your credentials.');
    }
    return await response.json();
  } catch (err) {
    throw new Error(formatErrorMessage(err, 'Login failed.'));
  }
}

export async function register(userData) {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Registration failed. Please check your information.');
    }
    return await response.json();
  } catch (err) {
    throw new Error(formatErrorMessage(err, 'Registration failed.'));
  }
}

// --- Products ---
export async function getProducts() {
  try {
    const response = await fetch(`${API_URL}/products`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Unable to load products (HTTP ${response.status})`);
    }
    return await response.json();
  } catch (err) {
    throw new Error(formatErrorMessage(err, 'Could not load products.'));
  }
}

export async function getProductById(id) {
  try {
    const response = await fetch(`${API_URL}/products/${id}`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 404) {
        throw new Error(errorData.message || 'Product not found. It may have been removed.');
      }
      throw new Error(errorData.message || `Unable to load product details (HTTP ${response.status})`);
    }
    return await response.json();
  } catch (err) {
    throw new Error(formatErrorMessage(err, 'Could not load product details.'));
  }
}

export async function createProduct(productData) {
  return fetchWithAuth(`${API_URL}/products`, {
    method: 'POST',
    body: JSON.stringify(productData)
  });
}

export async function updateProduct(id, productData) {
  return fetchWithAuth(`${API_URL}/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(productData)
  });
}

export async function deleteProduct(id) {
  return fetchWithAuth(`${API_URL}/products/${id}`, {
    method: 'DELETE'
  });
}

// --- Reviews ---
export async function getProductReviews(productId) {
  try {
    const response = await fetch(`${API_URL}/products/${productId}/reviews`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch reviews');
    }
    return await response.json();
  } catch (err) {
    throw new Error(formatErrorMessage(err, 'Failed to fetch reviews.'));
  }
}

export async function createReview(productId, reviewData) {
  return fetchWithAuth(`${API_URL}/products/${productId}/reviews`, {
    method: 'POST',
    body: JSON.stringify(reviewData)
  });
}

export async function updateReview(reviewId, reviewData) {
  return fetchWithAuth(`${API_URL}/reviews/${reviewId}`, {
    method: 'PUT',
    body: JSON.stringify(reviewData)
  });
}

export async function deleteReview(reviewId) {
  return fetchWithAuth(`${API_URL}/reviews/${reviewId}`, {
    method: 'DELETE'
  });
}
