import axios from 'axios';

export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const { hostname, port } = window.location;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return port === '3100' ? 'http://localhost:5100/api' : 'http://localhost:5000/api';
    }
    // In any live browser environment, relative '/api' is always the cleanest and safest
    return '/api';
  }
  if (process.env.NEXT_PUBLIC_API_URL && !process.env.NEXT_PUBLIC_API_URL.includes('localhost')) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  return 'https://bnnewsgujarati.com/api';
}

export const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject JWT token in request headers and ensure correct baseURL
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    config.baseURL = getApiBaseUrl();
    const token = localStorage.getItem('bn_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Interceptor to handle unauthorized 401 response
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== 'undefined' && error.response?.status === 401) {
      // If unauthorized on admin page, clear token and redirect to login
      if (window.location.pathname.startsWith('/admin') && !window.location.pathname.includes('/admin/login')) {
        localStorage.removeItem('bn_token');
        localStorage.removeItem('bn_user');
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
