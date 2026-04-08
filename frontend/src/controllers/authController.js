import { api, setSession } from '../lib/api';

export async function authenticateUser(payload) {
  const response = await api.login(payload);
  setSession(response.data?.token, response.data?.user);
  return response;
}

export async function registerUser(payload) {
  const response = await api.register(payload);
  setSession(response.data?.token, response.data?.user);
  return response;
}
