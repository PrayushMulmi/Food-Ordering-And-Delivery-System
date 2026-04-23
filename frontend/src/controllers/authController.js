import { loginRequest, registerRequest } from '../lib/api';

export const authenticateUser = async (payload) => loginRequest(payload);
export const registerUser = async (payload) => registerRequest(payload);
