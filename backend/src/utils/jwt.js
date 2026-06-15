// ============================================
// Helper JWT — FinStocks
// ============================================
// Fungsi untuk membuat dan memverifikasi JWT token

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'finstocks_jwt_secret_key_default';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';

/**
 * Buat JWT token dari data pengguna
 * @param {object} payload - Data yang akan disimpan di token { id, username, role }
 * @returns {string} JWT token
 */
const signToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

/**
 * Verifikasi dan decode JWT token
 * @param {string} token - JWT token yang akan diverifikasi
 * @returns {object} Decoded payload
 * @throws {Error} Jika token invalid atau expired
 */
const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

module.exports = {
  signToken,
  verifyToken,
};
