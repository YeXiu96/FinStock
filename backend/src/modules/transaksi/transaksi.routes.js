// ============================================
// Transaksi Routes — FinStocks
// ============================================

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const transaksiController = require('./transaksi.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const { requireRole } = require('../../middlewares/role.middleware');

// Semua route butuh auth
router.use(authMiddleware);

// GET /api/transaksi — List transaksi dengan filter (Owner & Karyawan)
router.get('/', requireRole('OWNER', 'KARYAWAN'), transaksiController.getAll);

// POST /api/transaksi — Tambah transaksi (Owner & Karyawan)
router.post('/', requireRole('OWNER', 'KARYAWAN'), [
  body('items').isArray({ min: 1 }).withMessage('Minimal 1 item dalam transaksi'),
  body('items.*.menuId').notEmpty().withMessage('Menu ID wajib diisi'),
  body('items.*.qty').isInt({ min: 1 }).withMessage('Qty minimal 1'),
  body('items.*.hargaSatuan').isFloat({ min: 0 }).withMessage('Harga satuan harus positif'),
  body('metode').notEmpty().withMessage('Metode pembayaran wajib diisi')
    .isIn(['TUNAI', 'QRIS', 'TRANSFER']).withMessage('Metode harus TUNAI, QRIS, atau TRANSFER'),
], transaksiController.create);

// GET /api/transaksi/:id — Detail transaksi (Owner only)
router.get('/:id', requireRole('OWNER'), transaksiController.getById);

// PUT /api/transaksi/:id/status — Update status (Owner only)
router.put('/:id/status', requireRole('OWNER'), [
  body('status').notEmpty().withMessage('Status wajib diisi')
    .isIn(['SELESAI', 'PENDING', 'BATAL']).withMessage('Status tidak valid'),
], transaksiController.updateStatus);

// DELETE /api/transaksi/:id — Hapus transaksi (Owner only)
router.delete('/:id', requireRole('OWNER'), transaksiController.remove);

module.exports = router;
