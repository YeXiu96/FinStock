// ============================================
// Auth Service — FinStocks
// ============================================
// Logika bisnis untuk autentikasi pengguna

const prisma = require('../../config/db');
const bcrypt = require('bcryptjs');
const { signToken } = require('../../utils/jwt');

const resetSessions = new Map();

const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));

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
 * Registrasi pengguna baru
 * @param {object} data
 * @returns {object} user tanpa password
 */
const register = async (data) => {
  const { nama, username, password, role = 'KARYAWAN' } = data;

  if (!nama || !username || !password) {
    throw { status: 400, message: 'Nama, username, dan password wajib diisi', code: 'MISSING_FIELDS' };
  }

  if (!['OWNER', 'KARYAWAN'].includes(role)) {
    throw { status: 400, message: 'Role tidak valid', code: 'INVALID_ROLE' };
  }

  const existingUser = await prisma.pengguna.findUnique({ where: { username } });
  if (existingUser) {
    throw { status: 400, message: 'Username sudah digunakan', code: 'USERNAME_EXISTS' };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const pengguna = await prisma.pengguna.create({
    data: {
      nama,
      username,
      password: hashedPassword,
      role,
      permissions: [],
      status: 'AKTIF',
    },
  });

  const { password: _, ...userData } = pengguna;
  return userData;
};

/**
 * Minta kode OTP untuk reset password
 * @param {string} username
 * @param {string} currentPassword
 * @returns {object} { otp, message }
 */
const requestPasswordReset = async (username, currentPassword = '') => {
  if (!username) {
    throw { status: 400, message: 'Username wajib diisi', code: 'MISSING_USERNAME' };
  }

  const pengguna = await prisma.pengguna.findUnique({ where: { username } });
  if (!pengguna) {
    throw { status: 404, message: 'Username tidak ditemukan', code: 'USER_NOT_FOUND' };
  }

  if (pengguna.status === 'NONAKTIF') {
    throw { status: 403, message: 'Akun Anda dinonaktifkan, hubungi admin', code: 'ACCOUNT_DISABLED' };
  }

  const isPasswordValid = currentPassword ? await bcrypt.compare(currentPassword, pengguna.password) : false;
  const otp = generateOtp();

  resetSessions.set(username, {
    userId: pengguna.id,
    otp,
    expiresAt: Date.now() + 10 * 60 * 1000,
  });

  return {
    otp,
    message: isPasswordValid
      ? 'Kode OTP berhasil dikirim untuk verifikasi reset password.'
      : 'Password lama tidak sesuai. Kode OTP berhasil dikirim untuk verifikasi keamanan.',
  };
};

/**
 * Verifikasi OTP dan ubah password baru
 * @param {string} username
 * @param {string} otp
 * @param {string} newPassword
 * @returns {boolean}
 */
const verifyPasswordReset = async (username, otp, newPassword) => {
  if (!username || !otp || !newPassword) {
    throw { status: 400, message: 'Username, OTP, dan password baru wajib diisi', code: 'MISSING_FIELDS' };
  }

  const session = resetSessions.get(username);
  if (!session) {
    throw { status: 400, message: 'Kode OTP belum dibuat atau sudah kedaluwarsa', code: 'OTP_NOT_FOUND' };
  }

  if (Date.now() > session.expiresAt) {
    resetSessions.delete(username);
    throw { status: 400, message: 'Kode OTP sudah kedaluwarsa. Silakan ajukan ulang.', code: 'OTP_EXPIRED' };
  }

  if (String(session.otp) !== String(otp)) {
    throw { status: 400, message: 'Kode OTP tidak valid', code: 'INVALID_OTP' };
  }

  if (newPassword.length < 6) {
    throw { status: 400, message: 'Password baru minimal 6 karakter', code: 'PASSWORD_TOO_SHORT' };
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await prisma.pengguna.update({
    where: { id: session.userId },
    data: { password: hashedPassword },
  });

  resetSessions.delete(username);
  return true;
};

/**
 * Reset password berdasarkan username (legacy compatibility)
 * @param {string} username
 * @param {string} newPassword
 * @returns {boolean}
 */
const forgotPassword = async (username, newPassword) => {
  if (!username || !newPassword) {
    throw { status: 400, message: 'Username dan password baru wajib diisi', code: 'MISSING_FIELDS' };
  }

  const pengguna = await prisma.pengguna.findUnique({ where: { username } });
  if (!pengguna) {
    throw { status: 404, message: 'Username tidak ditemukan', code: 'USER_NOT_FOUND' };
  }

  if (pengguna.status === 'NONAKTIF') {
    throw { status: 403, message: 'Akun Anda dinonaktifkan, hubungi admin', code: 'ACCOUNT_DISABLED' };
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await prisma.pengguna.update({
    where: { id: pengguna.id },
    data: { password: hashedPassword },
  });

  return true;
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
  register,
  forgotPassword,
  requestPasswordReset,
  verifyPasswordReset,
  getMe,
};
