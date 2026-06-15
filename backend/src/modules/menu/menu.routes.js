// ============================================
// Menu Routes — FinStocks
// ============================================

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const menuController = require('./menu.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const { requireRole } = require('../../middlewares/role.middleware');

// Semua route butuh auth
router.use(authMiddleware);

// GET /api/menu — List semua menu (Owner & Karyawan)
router.get('/', menuController.getAll);

// GET /api/menu/:id — Detail menu (Owner & Karyawan)
router.get('/:id', menuController.getById);

// POST /api/menu — Tambah menu (Owner only)
router.post('/', requireRole('OWNER'), [
  body('nama').notEmpty().withMessage('Nama menu wajib diisi'),
  body('kategori').notEmpty().withMessage('Kategori wajib diisi')
    .isIn(['MAKANAN', 'MINUMAN', 'SNACK']).withMessage('Kategori harus MAKANAN, MINUMAN, atau SNACK'),
  body('harga').notEmpty().withMessage('Harga wajib diisi')
    .isFloat({ min: 0 }).withMessage('Harga harus berupa angka positif'),
], menuController.create);

// PUT /api/menu/:id — Edit menu (Owner only)
router.put('/:id', requireRole('OWNER'), [
  body('nama').optional().notEmpty().withMessage('Nama menu tidak boleh kosong'),
  body('kategori').optional().isIn(['MAKANAN', 'MINUMAN', 'SNACK']).withMessage('Kategori tidak valid'),
  body('harga').optional().isFloat({ min: 0 }).withMessage('Harga harus berupa angka positif'),
  body('isAvailable').optional().isBoolean().withMessage('Status ketersediaan harus boolean'),
], menuController.update);

// DELETE /api/menu/:id — Hapus menu (Owner only)
router.delete('/:id', requireRole('OWNER'), menuController.remove);

module.exports = router;
