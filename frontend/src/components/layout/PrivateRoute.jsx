import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import DashboardLayout from './DashboardLayout';

/**
 * PrivateRoute — Melindungi semua route private dari akses tanpa login.
 * Merender DashboardLayout + Outlet untuk semua route anak.
 */
const PrivateRoute = () => {
  const { isAuthenticated } = useAuthStore();

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

