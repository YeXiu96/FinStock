// ============================================
// Persediaan Routes — FinStocks
// ============================================

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const persediaanController = require('./persediaan.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const { requireRole } = require('../../middlewares/role.middleware');

// Semua route butuh auth + role OWNER
router.use(authMiddleware);
router.use(requireRole('OWNER'));

// GET /api/persediaan — List semua bahan baku
router.get('/', persediaanController.getAll);

// GET /api/persediaan/riwayat — Riwayat keluar masuk stok
router.get('/riwayat', persediaanController.getRiwayat);

// GET /api/persediaan/:id — Detail bahan baku
router.get('/:id', persediaanController.getById);

// POST /api/persediaan — Tambah bahan baku baru
router.post('/', [
  body('namaBahan').notEmpty().withMessage('Nama bahan wajib diisi'),
  body('kategori').notEmpty().withMessage('Kategori wajib diisi')
    .isIn(['BAHAN_POKOK', 'BAHAN_MINUMAN', 'BUMBU', 'MINUMAN', 'LAINNYA']).withMessage('Kategori tidak valid'),
  body('stok').notEmpty().withMessage('Stok wajib diisi')
    .isFloat({ min: 0 }).withMessage('Stok harus angka positif'),
  body('satuan').notEmpty().withMessage('Satuan wajib diisi'),
  body('stokMinimum').notEmpty().withMessage('Stok minimum wajib diisi')
    .isFloat({ min: 0 }).withMessage('Stok minimum harus angka positif'),
  body('hargaSatuan').optional().isFloat({ min: 0 }).withMessage('Harga satuan harus angka positif'),
], persediaanController.create);

// PUT /api/persediaan/:id — Update bahan baku
router.put('/:id', [
  body('namaBahan').optional().notEmpty().withMessage('Nama bahan tidak boleh kosong'),
  body('kategori').optional().isIn(['BAHAN_POKOK', 'BAHAN_MINUMAN', 'BUMBU', 'MINUMAN', 'LAINNYA']),
  body('stok').optional().isFloat({ min: 0 }).withMessage('Stok harus angka positif'),
  body('stokMinimum').optional().isFloat({ min: 0 }).withMessage('Stok minimum harus angka positif'),
  body('hargaSatuan').optional().isFloat({ min: 0 }).withMessage('Harga satuan harus angka positif'),
], persediaanController.update);

// DELETE /api/persediaan/:id — Hapus bahan baku
router.delete('/:id', persediaanController.remove);

// POST /api/persediaan/:id/restock — Input stok masuk
router.post('/:id/restock', [
  body('jumlah').notEmpty().withMessage('Jumlah restock wajib diisi')
    .isFloat({ min: 0.01 }).withMessage('Jumlah harus lebih dari 0'),
  body('keterangan').optional().isString(),
], persediaanController.restock);

module.exports = router;
