// ============================================
// Auth Service — FinStocks
// ============================================
// Logika bisnis untuk autentikasi pengguna

const prisma = require('../../config/db');
const bcrypt = require('bcryptjs');
const { signToken } = require('../../utils/jwt');

/**
 * Proses login pengguna
 * @param {string} username
 * @param {string} password
 * @returns {object} { token, user }
 */
const login = async (username, password) => {
  // Cari pengguna berdasarkan username
  const pengguna = await prisma.pengguna.findUnique({
    where: { username },
  });

  if (!pengguna) {
    throw { status: 401, message: 'Username atau password salah', code: 'INVALID_CREDENTIALS' };
  }

  // Cek apakah akun aktif
  if (pengguna.status === 'NONAKTIF') {
    throw { status: 403, message: 'Akun Anda telah dinonaktifkan. Hubungi admin.', code: 'ACCOUNT_DISABLED' };
  }

  // Verifikasi password
  const isPasswordValid = await bcrypt.compare(password, pengguna.password);
  if (!isPasswordValid) {
    throw { status: 401, message: 'Username atau password salah', code: 'INVALID_CREDENTIALS' };
  }

  // Buat JWT token
  const token = signToken({
    id: pengguna.id,
    username: pengguna.username,
    role: pengguna.role,
    permissions: pengguna.permissions || [],
  });

  // Catat log aktivitas login
  await prisma.logAktivitas.create({
    data: {
      penggunaId: pengguna.id,
      aksi: 'Login ke sistem',
    },
  });

  // Return data tanpa password
  const { password: _, ...userData } = pengguna;
  return { token, user: userData };
};

/**
 * Ambil data pengguna yang sedang login
 * @param {number} userId - ID pengguna dari token
 * @returns {object} Data pengguna tanpa password
 */
const getMe = async (userId) => {
  const pengguna = await prisma.pengguna.findUnique({
    where: { id: userId },
  });

  if (!pengguna) {
    throw { status: 404, message: 'Pengguna tidak ditemukan', code: 'USER_NOT_FOUND' };
  }

  // Return tanpa password
  const { password: _, ...userData } = pengguna;
  return userData;
};

module.exports = {
  login,
  getMe,
};
