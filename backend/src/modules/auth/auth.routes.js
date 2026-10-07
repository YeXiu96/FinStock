// ============================================
// Auth Routes — FinStocks
// ============================================
// Endpoint autentikasi: login, logout, me

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('./auth.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

// POST /api/auth/login — Login pengguna (publik)
router.post(
  '/login',
  [
    body('username')
      .notEmpty().withMessage('Username wajib diisi')
      .isString().withMessage('Username harus berupa teks'),
    body('password')
      .notEmpty().withMessage('Password wajib diisi')
      .isLength({ min: 6 }).withMessage('Password minimal 6 karakter'),
  ],
  authController.login
);

// POST /api/auth/register — Registrasi pengguna baru (publik)
router.post(
  '/register',
  [
    body('nama').notEmpty().withMessage('Nama wajib diisi'),
    body('username')
      .notEmpty().withMessage('Username wajib diisi')
      .isLength({ min: 3 }).withMessage('Username minimal 3 karakter'),
    body('password')
      .notEmpty().withMessage('Password wajib diisi')
      .isLength({ min: 6 }).withMessage('Password minimal 6 karakter'),
    body('role').optional().isIn(['OWNER', 'KARYAWAN']).withMessage('Role harus OWNER atau KARYAWAN'),
  ],
  authController.register
);

// POST /api/auth/forgot-password/request — Kirim OTP reset password
router.post(
  '/forgot-password/request',
  [
    body('username')
      .notEmpty().withMessage('Username atau email wajib diisi')
      .isString().withMessage('Username atau email harus berupa teks'),
    body('currentPassword')
      .optional({ checkFalsy: true })
      .isLength({ min: 6 }).withMessage('Password lama minimal 6 karakter'),
  ],
  authController.requestForgotPassword
);

// POST /api/auth/forgot-password/verify — Verifikasi OTP/Token dan ubah password baru
router.post(
  '/forgot-password/verify',
  [
    body('username').optional().isString().withMessage('Username harus berupa teks'),
    body('otp').optional({ checkFalsy: true }).isLength({ min: 6, max: 6 }).withMessage('OTP harus 6 digit'),
    body('token').optional({ checkFalsy: true }).isString().withMessage('Token harus berupa string'),
    body('newPassword')
      .notEmpty().withMessage('Password baru wajib diisi')
      .isLength({ min: 6 }).withMessage('Password baru minimal 6 karakter'),
  ],
  authController.verifyForgotPassword
);

// POST /api/auth/forgot-password — Legacy compatibility
router.post(
  '/forgot-password',
  [
    body('username')
      .notEmpty().withMessage('Username wajib diisi')
      .isString().withMessage('Username harus berupa teks'),
    body('newPassword')
      .notEmpty().withMessage('Password baru wajib diisi')
      .isLength({ min: 6 }).withMessage('Password baru minimal 6 karakter'),
  ],
  authController.forgotPassword
);

// POST /api/auth/logout — Logout pengguna (perlu auth)
router.post('/logout', authMiddleware, authController.logout);

// GET /api/auth/me — Data pengguna yang login (perlu auth)
router.get('/me', authMiddleware, authController.getMe);

module.exports = router;
