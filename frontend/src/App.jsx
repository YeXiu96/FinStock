// ============================================
// Router Utama — FinStocks
// ============================================

import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './components/layout/PrivateRoute';
import RoleGuard from './components/layout/RoleGuard';

// Pages
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Transaksi from './pages/Transaksi';
import Kasir from './pages/Kasir';
import DetailTransaksi from './pages/DetailTransaksi';
import DaftarMenu from './pages/DaftarMenu';
import Persediaan from './pages/Persediaan';
import Laporan from './pages/Laporan';
import Pengguna from './pages/Pengguna';
import Pengaturan from './pages/Pengaturan';
import Vendor from './pages/Vendor';
import DetailVendor from './pages/DetailVendor';
import Pengeluaran from './pages/Pengeluaran';

function App() {
  return (
    <Routes>
      {/* Route publik */}
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Route private (butuh auth) — semua route di bawah ini punya DashboardLayout */}
      <Route path="/" element={<PrivateRoute />}>
        <Route index element={<Dashboard />} />
        <Route path="transaksi" element={<Transaksi />} />
        <Route path="kasir" element={<RoleGuard allowedRoles={['KARYAWAN']}><Kasir /></RoleGuard>} />
        <Route path="transaksi/:id" element={<RoleGuard requiredPermission="/transaksi"><DetailTransaksi /></RoleGuard>} />
        <Route path="pengaturan" element={<RoleGuard requiredPermission="/pengaturan"><Pengaturan /></RoleGuard>} />

        <Route path="menu" element={<RoleGuard requiredPermission="/menu"><DaftarMenu /></RoleGuard>} />
        <Route path="persediaan" element={<RoleGuard requiredPermission="/persediaan"><Persediaan /></RoleGuard>} />
        <Route path="laporan" element={<RoleGuard requiredPermission="/laporan"><Laporan /></RoleGuard>} />
        <Route path="pengguna" element={<RoleGuard allowedRoles={['OWNER']}><Pengguna /></RoleGuard>} />
        <Route path="vendor" element={<RoleGuard requiredPermission="/vendor"><Vendor /></RoleGuard>} />
        <Route path="vendor/:id" element={<RoleGuard requiredPermission="/vendor"><DetailVendor /></RoleGuard>} />
        <Route path="pengeluaran" element={<RoleGuard requiredPermission="/pengeluaran"><Pengeluaran /></RoleGuard>} />
      </Route>

      {/* 404 Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

