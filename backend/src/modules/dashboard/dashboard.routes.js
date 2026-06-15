// ============================================
// Dashboard Routes — FinStocks
// ============================================

const express = require('express');
const router = express.Router();
const dashboardController = require('./dashboard.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const { requireRole } = require('../../middlewares/role.middleware');

// Semua route dashboard butuh auth + role OWNER & KARYAWAN
router.use(authMiddleware);
router.use(requireRole('OWNER', 'KARYAWAN'));

// GET /api/dashboard/summary — Summary hari ini
router.get('/summary', dashboardController.getSummary);

// GET /api/dashboard/grafik — Data grafik 7 hari terakhir
router.get('/grafik', dashboardController.getGrafik);

// GET /api/dashboard/menu-terlaris — Top 5 menu terlaris
router.get('/menu-terlaris', dashboardController.getMenuTerlaris);

// GET /api/dashboard/stok-kritis — Bahan baku hampir habis
router.get('/stok-kritis', dashboardController.getStokKritis);

module.exports = router;
