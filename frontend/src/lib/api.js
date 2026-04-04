const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

export function getToken() {
  return localStorage.getItem('auth_token') || '';
}

export function setSession(token, user) {
  if (token) localStorage.setItem('auth_token', token);
  if (user) localStorage.setItem('auth_user', JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
}

export function getCurrentUser() {
  const raw = localStorage.getItem('auth_user');
  return raw ? JSON.parse(raw) : null;
}

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
}

export const api = {
  health: () => request('/api/health'),
  register: (payload) => request('/api/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  getMe: () => request('/api/auth/me'),
  getRestaurants: (search = '') => request(`/api/restaurants${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  getRestaurantById: (id) => request(`/api/restaurants/${id}`),
  getBasket: () => request('/api/basket'),
  addToBasket: (menu_item_id, quantity = 1) => request('/api/basket/items', { method: 'POST', body: JSON.stringify({ menu_item_id, quantity }) }),
  updateBasketItem: (itemId, quantity) => request(`/api/basket/items/${itemId}`, { method: 'PUT', body: JSON.stringify({ quantity }) }),
  removeBasketItem: (itemId) => request(`/api/basket/items/${itemId}`, { method: 'DELETE' }),
  clearBasket: () => request('/api/basket', { method: 'DELETE' }),
  placeOrder: (payload) => request('/api/orders', { method: 'POST', body: JSON.stringify(payload) }),
  getMyOrders: () => request('/api/orders/my'),
  getMyOrderById: (id) => request(`/api/orders/my/${id}`),
};
