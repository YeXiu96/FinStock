import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import DashboardLayout from './DashboardLayout';
import axiosInstance from '../../api/axiosInstance';

/**
 * PrivateRoute — Melindungi semua route private dari akses tanpa login.
 * Merender DashboardLayout + Outlet untuk semua route anak.
 */
const PrivateRoute = () => {
  const { isAuthenticated, updateUser } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      axiosInstance.get('/auth/me')
        .then((res) => {
          if (res.data?.data) {
            updateUser(res.data.data);
          }
        })
        .catch(() => {
          // Token expired atau error akan ditangani oleh response interceptor axios
        });
    }
  }, [isAuthenticated, updateUser]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
};

export default PrivateRoute;

