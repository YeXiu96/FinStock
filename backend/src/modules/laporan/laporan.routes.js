// ============================================
// Laporan Routes — FinStocks
// ============================================

const express = require('express');
const router = express.Router();
const laporanController = require('./laporan.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const { requireRole } = require('../../middlewares/role.middleware');

// Semua route laporan butuh auth + role OWNER (KARYAWAN allowed partially)
router.use(authMiddleware);
router.use(requireRole('OWNER', 'KARYAWAN'));

// GET /api/laporan/keuangan?periode=bulanan&tanggal=2026-05-10
router.get('/keuangan', laporanController.getKeuangan);

// GET /api/laporan/export/pdf?periode=bulanan&tanggal=2026-05-10
router.get('/export/pdf', laporanController.exportPDF);

// GET /api/laporan/export/excel?periode=bulanan&tanggal=2026-05-10
router.get('/export/excel', laporanController.exportExcel);

module.exports = router;
