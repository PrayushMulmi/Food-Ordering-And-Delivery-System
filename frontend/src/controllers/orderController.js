import { api } from '../lib/api';

const orderKey = (order) => order?.order_code || order?.code;

export const createOrder = async (payload) => api.post('/api/orders', payload);
export const fetchMyOrders = async () => api.get('/api/orders/my');
export const fetchMyOrder = async (code) => api.get(`/api/orders/my/${encodeURIComponent(code)}`);
export const cancelMyOrder = async (code) => api.put(`/api/orders/my/${encodeURIComponent(code)}/cancel`, {});
export { orderKey };
