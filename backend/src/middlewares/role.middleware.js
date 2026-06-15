// ============================================
// Middleware Cek Role — FinStocks
// ============================================
// Memastikan pengguna memiliki role yang sesuai
// Digunakan setelah authMiddleware

const { sendError } = require('../utils/response');

/**
 * Middleware untuk membatasi akses berdasarkan role
 * @param  {...string} allowedRoles - Role yang diizinkan (contoh: 'OWNER', 'KARYAWAN')
 * @returns {function} Express middleware
 *
 * Contoh penggunaan:
 *   router.get('/admin', authMiddleware, requireRole('OWNER'), controller.adminOnly);
 *   router.get('/all', authMiddleware, requireRole('OWNER', 'KARYAWAN'), controller.allRoles);
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    // Pastikan user sudah ter-autentikasi (authMiddleware sudah jalan)
    if (!req.user) {
      return sendError(res, 'Autentikasi diperlukan.', 401, 'NOT_AUTHENTICATED');
    }

    // Cek apakah role user termasuk dalam daftar yang diizinkan
    if (!allowedRoles.includes(req.user.role)) {
      return sendError(
        res,
        'Anda tidak memiliki akses untuk melakukan aksi ini.',
        403,
        'FORBIDDEN'
      );
    }

    next();
  };
};

module.exports = { requireRole };
