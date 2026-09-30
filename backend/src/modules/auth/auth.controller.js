// ============================================
// Auth Controller — FinStocks
// ============================================
// Handler request untuk endpoint autentikasi

const authService = require('./auth.service');
const { sendSuccess, sendError, sendValidationError } = require('../../utils/response');
const { validationResult } = require('express-validator');

/**
 * POST /api/auth/login
 * Login pengguna dan dapatkan JWT token
 */
const login = async (req, res) => {
  try {
    // Cek validasi input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendValidationError(res, errors.array());
    }

    const { username, password } = req.body;
    const result = await authService.login(username, password);

    return sendSuccess(res, 'Login berhasil', result);
  } catch (error) {
    return sendError(res, error.message, error.status || 500, error.code);
  }
};

/**
 * POST /api/auth/register
 * Registrasi pengguna baru
 */
const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendValidationError(res, errors.array());
    }

    const result = await authService.register(req.body);
    return sendSuccess(res, 'Registrasi berhasil', result);
  } catch (error) {
    return sendError(res, error.message, error.status || 500, error.code);
  }
};

/**
 * POST /api/auth/forgot-password/request
 * Mengirim OTP untuk reset password
 */
const requestForgotPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendValidationError(res, errors.array());
    }

    const { username, currentPassword } = req.body;
    const result = await authService.requestPasswordReset(username, currentPassword);
    return sendSuccess(res, 'Kode OTP berhasil dikirim', result);
  } catch (error) {
    return sendError(res, error.message, error.status || 500, error.code);
  }
};

/**
 * POST /api/auth/forgot-password/verify
 * Verifikasi OTP dan ubah password baru
 */
const verifyForgotPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendValidationError(res, errors.array());
    }

    const { username, otp, newPassword } = req.body;
    await authService.verifyPasswordReset(username, otp, newPassword);
    return sendSuccess(res, 'Password berhasil diubah');
  } catch (error) {
    return sendError(res, error.message, error.status || 500, error.code);
  }
};

/**
 * POST /api/auth/forgot-password
 * Reset password berdasarkan username (legacy compatibility)
 */
const forgotPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendValidationError(res, errors.array());
    }

    const { username, newPassword } = req.body;
    await authService.forgotPassword(username, newPassword);
    return sendSuccess(res, 'Password berhasil direset');
  } catch (error) {
    return sendError(res, error.message, error.status || 500, error.code);
  }
};

/**
 * GET /api/auth/me
 * Ambil data pengguna yang sedang login
 */
const getMe = async (req, res) => {
  try {
    const user = await authService.getMe(req.user.id);
    return sendSuccess(res, 'Data pengguna berhasil diambil', user);
  } catch (error) {
    return sendError(res, error.message, error.status || 500, error.code);
  }
};

/**
 * POST /api/auth/logout
 * Logout pengguna (client-side token removal)
 */
const logout = async (req, res) => {
  try {
    return sendSuccess(res, 'Logout berhasil');
  } catch (error) {
    return sendError(res, error.message, error.status || 500);
  }
};

module.exports = {
  login,
  register,
  forgotPassword,
  requestForgotPassword,
  verifyForgotPassword,
  getMe,
  logout,
};
