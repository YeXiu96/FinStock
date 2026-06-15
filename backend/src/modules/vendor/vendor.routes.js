// ============================================
// Vendor Routes — FinStocks
// ============================================

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const vendorController = require('./vendor.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const { requireRole } = require('../../middlewares/role.middleware');

// Semua route vendor membutuhkan auth + role OWNER
router.use(authMiddleware);
router.use(requireRole('OWNER'));

// ============ VENDOR ROUTES ============

// GET /api/vendor — List semua vendor (tanpa produk)
router.get('/', vendorController.getAll);

// GET /api/vendor/:id — Detail vendor + produk
router.get('/:id', vendorController.getById);

// POST /api/vendor — Tambah vendor baru
router.post('/', [
  body('nama').notEmpty().withMessage('Nama vendor wajib diisi'),
  body('telepon').optional().isString(),
  body('email').optional().isEmail().withMessage('Format email tidak valid'),
  body('alamat').optional().isString(),
  body('status').optional().isIn(['AKTIF', 'NONAKTIF']).withMessage('Status harus AKTIF atau NONAKTIF'),
], vendorController.create);

// PUT /api/vendor/:id — Edit vendor
router.put('/:id', [
  body('nama').optional().notEmpty().withMessage('Nama vendor tidak boleh kosong'),
  body('telepon').optional().isString(),
  body('email').optional().isEmail().withMessage('Format email tidak valid'),
  body('alamat').optional().isString(),
  body('status').optional().isIn(['AKTIF', 'NONAKTIF']).withMessage('Status harus AKTIF atau NONAKTIF'),
], vendorController.update);

// DELETE /api/vendor/:id — Hapus vendor
router.delete('/:id', vendorController.remove);

// ============ PRODUK VENDOR ROUTES ============

// GET /api/vendor/:id/produk — List produk vendor
router.get('/:id/produk', vendorController.getProduk);

// POST /api/vendor/:id/produk — Tambah produk ke vendor
router.post('/:id/produk', [
  body('namaProduk').notEmpty().withMessage('Nama produk wajib diisi'),
  body('harga').notEmpty().withMessage('Harga wajib diisi')
    .isFloat({ min: 0 }).withMessage('Harga harus angka positif'),
  body('satuan').notEmpty().withMessage('Satuan wajib diisi'),
  body('keterangan').optional().isString(),
], vendorController.addProduk);

// PUT /api/vendor/:id/produk/:produkId — Edit produk vendor
router.put('/:id/produk/:produkId', [
  body('namaProduk').optional().notEmpty().withMessage('Nama produk tidak boleh kosong'),
  body('harga').optional().isFloat({ min: 0 }).withMessage('Harga harus angka positif'),
  body('satuan').optional().notEmpty().withMessage('Satuan tidak boleh kosong'),
  body('keterangan').optional().isString(),
], vendorController.updateProduk);

// DELETE /api/vendor/:id/produk/:produkId — Hapus produk vendor
router.delete('/:id/produk/:produkId', vendorController.removeProduk);

module.exports = router;
