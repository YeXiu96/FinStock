// ============================================
// Zustand Auth Store — FinStocks
// ============================================
// State management untuk autentikasi pengguna
// Akan dilengkapi di Task 18

import { create } from 'zustand';

const useAuthStore = create((set) => ({
  // State
  token: localStorage.getItem('finstocks_token') || null,
  user: JSON.parse(localStorage.getItem('finstocks_user') || 'null'),
  isAuthenticated: !!localStorage.getItem('finstocks_token'),

  // Action: Set data login
  setAuth: (token, user) => {
    localStorage.setItem('finstocks_token', token);
    localStorage.setItem('finstocks_user', JSON.stringify(user));
    set({ token, user, isAuthenticated: true });
  },

  // Action: Logout — hapus semua data auth
  logout: () => {
    localStorage.removeItem('finstocks_token');
    localStorage.removeItem('finstocks_user');
    set({ token: null, user: null, isAuthenticated: false });
  },

  // Action: Update data user (tanpa ganti token)
  updateUser: (user) => {
    localStorage.setItem('finstocks_user', JSON.stringify(user));
    set({ user });
  },
}));

export default useAuthStore;
