import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const ACCESS_TOKEN_STORAGE_KEY = 'pcinfotech_access_token';
let accessToken: string | null = null;
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

if (typeof window !== 'undefined') {
  accessToken = window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
}

export const setAccessToken = (token: string | null) => {
  accessToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);
    } else {
      window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
    }
  }
};

export const getAccessToken = () => accessToken;

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
  withCredentials: true,
});

// Request interceptor: add bearer token to headers, but skip auth routes
api.interceptors.request.use(
  (config) => {
    const url = config.url || '';
    const isAuthRoute = url.includes('/auth/login') || url.includes('/auth/refresh-token') || url.includes('/auth/forgot-password') || url.includes('/auth/reset-password') || url.includes('/auth/logout');

    if (!isAuthRoute && accessToken) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: intercept 401s to perform RTR
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const requestUrl = originalRequest?.url || '';
    const isAuthRoute = requestUrl.includes('/auth/login') || requestUrl.includes('/auth/refresh-token') || requestUrl.includes('/auth/forgot-password') || requestUrl.includes('/auth/reset-password');

    // Do not attempt token refresh for auth routes themselves
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRoute) {
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const response = await axios.post(
            (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1') + '/auth/refresh-token',
            {},
            { withCredentials: true }
          );

          const newToken = response.data?.data?.accessToken;
          if (newToken) {
            setAccessToken(newToken);
            isRefreshing = false;
            onTokenRefreshed(newToken);
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          }
        } catch (refreshError: any) {
          isRefreshing = false;
          setAccessToken(null);
          if (typeof window !== 'undefined') {
            window.location.href = '/?expired=true';
          }
          return Promise.reject(refreshError);
        }
      }

      return new Promise((resolve) => {
        addRefreshSubscriber((token) => {
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(api(originalRequest));
        });
      });
    }

    if (error.response?.status === 403) {
      setAccessToken(null);
      if (typeof window !== 'undefined') {
        window.location.href = '/?expired=true';
      }
    }

    return Promise.reject(error);
  }
);

function addRefreshSubscriber(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

export default api;
