import { api } from '../lib/api';

export const createOrder = async (payload) => api.post('/api/orders', payload);
export const fetchMyOrders = async () => api.get('/api/orders/my');
export const fetchMyOrder = async (id) => api.get(`/api/orders/my/${id}`);
export const cancelMyOrder = async (id) => api.put(`/api/orders/my/${id}/cancel`, {});
