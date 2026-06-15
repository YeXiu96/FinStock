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

// POST /api/auth/logout — Logout pengguna (perlu auth)
router.post('/logout', authMiddleware, authController.logout);

// GET /api/auth/me — Data pengguna yang login (perlu auth)
router.get('/me', authMiddleware, authController.getMe);

module.exports = router;
