import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';

/**
 * RoleGuard — Komponen untuk memproteksi halaman berdasarkan role
 * Berbeda dengan PrivateRoute, RoleGuard TIDAK merender DashboardLayout
 * karena layout sudah ada dari route parent (PrivateRoute).
 * 
 * Gunakan ini untuk route anak (nested) yang butuh cek role saja.
 */
const RoleGuard = ({ allowedRoles, requiredPermission, children }) => {
  const { user } = useAuthStore();

  if (!user) return <Navigate to="/login" replace />;

  // If allowedRoles is specified, check it strictly (no OWNER bypass)
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  // OWNER bypasses permission checks (but not allowedRoles check above)
  if (user.role === 'OWNER') {
    return children;
  }

  // If there's a required permission, check it for non-OWNER users
  if (requiredPermission) {
    if (!user.permissions || !user.permissions.includes(requiredPermission)) {
      return <Navigate to="/" replace />;
    }
    return children;
  }

  return children;
};

export default RoleGuard;
