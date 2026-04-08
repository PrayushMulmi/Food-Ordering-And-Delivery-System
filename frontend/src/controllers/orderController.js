import { api } from '../lib/api';

export async function createOrder(payload) {
  return api.placeOrder(payload);
}
