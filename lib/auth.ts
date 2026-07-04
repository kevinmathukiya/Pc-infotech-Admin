import axios from 'axios';
import api from './api';

export interface LoginResponse {
  accessToken?: string;
  admin?: any;
  user?: any;
}

const authApi = axios.create({
  baseURL: 'http://localhost:5000/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

authApi.interceptors.request.use((config) => {
  config.headers = config.headers || {};
  delete (config.headers as any).Authorization;
  return config;
});

export const login = (email: string, password: string) =>
  authApi.post('/auth/login', { email, password });

export const getMe = () => api.get('/auth/me');

export const changePassword = (currentPassword: string, newPassword: string) =>
  api.patch('/auth/change-password', { currentPassword, newPassword });

export const forgotPassword = (email: string) =>
  authApi.post('/auth/forgot-password', { email });

export const resetPassword = (token: string, password: string) =>
  authApi.post(`/auth/reset-password/${token}`, { password });

export const logout = (refreshToken?: string) =>
  api.post('/auth/logout', refreshToken ? { refreshToken } : {});

export const refreshAccessToken = () => authApi.post('/auth/refresh-token');

export const updateProfile = (data: { name: string; email: string; age?: number; mobileNumber?: string }) =>
  api.put('/auth/update-profile', data);
