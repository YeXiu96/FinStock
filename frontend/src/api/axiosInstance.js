// ============================================
// Axios Instance — FinStocks
// ============================================
// Konfigurasi Axios dengan:
// - Base URL dari environment variable
// - Interceptor request: otomatis attach JWT token
// - Interceptor response: handle 401 (token expired)

import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================
// Request Interceptor
// ============================================
// Otomatis tambahkan Authorization header jika token ada di localStorage
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('finstocks_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ============================================
// Response Interceptor
// ============================================
// Jika response 401 (Unauthorized), hapus token dan redirect ke login
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Hapus token dari localStorage
      localStorage.removeItem('finstocks_token');
      localStorage.removeItem('finstocks_user');

      // Redirect ke halaman login jika belum di halaman login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
