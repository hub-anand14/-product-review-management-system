const rawApiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000').trim().replace(/\/+$/, '');
const API_URL = rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl}/api`;

// Helper for making requests with authentication (to be used later when auth is implemented)
async function fetchWithAuth(url, options = {}) {
  // Retrieve token from local storage (assuming this strategy for now)
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'API request failed');
  }
  return response.json();
}

// --- Auth ---
export async function login(credentials) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  if (!response.ok) {
    throw new Error('Login failed');
  }
  return response.json();
}

export async function register(userData) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  if (!response.ok) {
    throw new Error('Registration failed');
  }
  return response.json();
}

// --- Products ---
export async function getProducts() {
  const response = await fetch(`${API_URL}/products`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch products');
  }
  return response.json();
}

export async function getProductById(id) {
  const response = await fetch(`${API_URL}/products/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch product details');
  }
  return response.json();
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
  const response = await fetch(`${API_URL}/products/${productId}/reviews`);
  if (!response.ok) {
    throw new Error('Failed to fetch reviews');
  }
  return response.json();
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
