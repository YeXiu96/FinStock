// ============================================
// Pengeluaran Routes — FinStocks
// ============================================

const express = require('express');
const router = express.Router();
const pengeluaranController = require('./pengeluaran.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const { requireRole } = require('../../middlewares/role.middleware');
const upload = require('../../middlewares/upload.middleware');

// Semua route butuh auth + role OWNER
router.use(authMiddleware);
router.use(requireRole('OWNER'));

// GET /api/pengeluaran/summary
router.get('/summary', pengeluaranController.getSummary);

// GET /api/pengeluaran
router.get('/', pengeluaranController.getAll);

// GET /api/pengeluaran/:id
router.get('/:id', pengeluaranController.getById);

// POST /api/pengeluaran
router.post('/', upload.single('bukti'), pengeluaranController.create);

// PUT /api/pengeluaran/:id
router.put('/:id', upload.single('bukti'), pengeluaranController.update);

// DELETE /api/pengeluaran/:id
router.delete('/:id', pengeluaranController.remove);

module.exports = router;
