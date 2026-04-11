import { clearSession, getToken, setSession } from './auth';

export const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5050';

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  } catch (error) {
    throw new Error('Unable to reach the API. Check backend URL, CORS settings, and that the server is running.');
  }

  let data = null;
  try { data = await response.json(); } catch { data = null; }

  if (!response.ok) {
    if (response.status === 401) clearSession();
    throw new Error(data?.message || 'Request failed');
  }
  return data;
}

export const fileUrl = (path) => {
  if (!path) return '';
  return path.startsWith('http') ? path : `${API_BASE}${path}`;
};

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: 'DELETE' }),
};

export async function loginRequest(payload) {
  const data = await api.post('/api/auth/login', payload);
  if (data?.data?.token && data?.data?.user) setSession(data.data);
  return data;
}

export async function registerRequest(payload) {
  const data = await api.post('/api/auth/register', payload);
  if (data?.data?.token && data?.data?.user) setSession(data.data);
  return data;
}
