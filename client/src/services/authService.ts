import { apiClient } from './apiClient';

export const login = (data: any) => apiClient('/auth/login', { method: 'POST', body: JSON.stringify(data) });
export const register = (data: any) => apiClient('/auth/register', { method: 'POST', body: JSON.stringify(data) });