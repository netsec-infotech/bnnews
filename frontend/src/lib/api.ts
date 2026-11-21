import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject JWT token in request headers
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
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
