// ============================================
// Middleware Verifikasi JWT — FinStocks
// ============================================
// Memverifikasi token JWT dari header Authorization
// Jika valid, data pengguna disimpan di req.user

const { verifyToken } = require('../utils/jwt');
const { sendError } = require('../utils/response');

const authMiddleware = (req, res, next) => {
  try {
    // Ambil token dari header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Token tidak ditemukan. Silakan login terlebih dahulu.', 401, 'TOKEN_MISSING');
    }

    // Ekstrak token (hilangkan prefix "Bearer ")
    const token = authHeader.split(' ')[1];

    // Verifikasi token
    const decoded = verifyToken(token);

    // Simpan data pengguna di request object
    req.user = {
      id: decoded.id,
      username: decoded.username,
      role: decoded.role,
      permissions: decoded.permissions || [],
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 'Sesi Anda telah berakhir. Silakan login kembali.', 401, 'TOKEN_EXPIRED');
    }
    if (error.name === 'JsonWebTokenError') {
      return sendError(res, 'Token tidak valid.', 401, 'TOKEN_INVALID');
    }
    return sendError(res, 'Gagal memverifikasi autentikasi.', 500, 'AUTH_ERROR');
  }
};

module.exports = authMiddleware;
