// ============================================
// Auth Service — FinStocks
// ============================================
// Logika bisnis untuk autentikasi pengguna

const prisma = require('../../config/db');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { signToken } = require('../../utils/jwt');
const { sendResetPasswordEmail, maskEmail } = require('../../utils/mailer');

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
 * Minta link dan kode OTP untuk reset password via email
 * @param {string} identifier - username atau email
 * @param {string} currentPassword - password lama (opsional)
 * @returns {object} { message, maskedEmail, username }
 */
const requestPasswordReset = async (identifier, currentPassword = '') => {
  if (!identifier) {
    throw { status: 400, message: 'Username atau email wajib diisi', code: 'MISSING_IDENTIFIER' };
  }

  const query = identifier.trim();
  const pengguna = await prisma.pengguna.findFirst({
    where: {
      OR: [
        { username: query },
        { email: query },
      ],
    },
  });

  if (!pengguna) {
    throw { status: 404, message: 'Pengguna dengan username atau email tersebut tidak ditemukan', code: 'USER_NOT_FOUND' };
  }

  if (pengguna.status === 'NONAKTIF') {
    throw { status: 403, message: 'Akun Anda dinonaktifkan, silakan hubungi admin', code: 'ACCOUNT_DISABLED' };
  }

  // Jika password lama disertakan, validasi kecocokan
  if (currentPassword) {
    const isPasswordValid = await bcrypt.compare(currentPassword, pengguna.password);
    if (!isPasswordValid) {
      throw { status: 400, message: 'Password lama yang dimasukkan tidak sesuai', code: 'INVALID_CURRENT_PASSWORD' };
    }
  }

  if (!pengguna.email) {
    throw {
      status: 400,
      message: `Akun "${pengguna.username}" belum memiliki email terdaftar. Hubungi Owner untuk reset password.`,
      code: 'NO_EMAIL_REGISTERED',
    };
  }

  const otp = generateOtp();
  const token = crypto.randomBytes(32).toString('hex');

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const resetLink = `${frontendUrl}/reset-password?username=${encodeURIComponent(pengguna.username)}&token=${token}`;

  const sessionData = {
    userId: pengguna.id,
    username: pengguna.username,
    email: pengguna.email,
    otp,
    token,
    expiresAt: Date.now() + 15 * 60 * 1000, // 15 menit
  };

  // Simpan session berdasarkan username dan token
  resetSessions.set(pengguna.username, sessionData);
  resetSessions.set(`token:${token}`, sessionData);

  // Kirim email ke Gmail penerima dengan tombol link dan kode OTP
  await sendResetPasswordEmail({
    to: pengguna.email,
    name: pengguna.nama,
    otp,
    resetLink,
  });

  const masked = maskEmail(pengguna.email);

  return {
    username: pengguna.username,
    email: pengguna.email,
    maskedEmail: masked,
    message: `Tautan dan kode reset password telah dikirim ke email ${pengguna.email}. Silakan periksa aplikasi atau web Gmail Anda.`,
    // Catatan: Kode OTP TIDAK disertakan di response API agar pengguna membukanya langsung di Gmail!
  };
};

/**
 * Verifikasi token/OTP dan ubah password baru
 * @param {object} params
 * @param {string} params.identifier - username atau email (opsional jika token ada)
 * @param {string} params.otp - kode OTP (opsional jika token ada)
 * @param {string} params.token - token dari tautan email (opsional jika OTP ada)
 * @param {string} params.newPassword - password baru
 * @returns {boolean}
 */
const verifyPasswordReset = async ({ identifier = '', otp = '', token = '', newPassword = '' }) => {
  if (!newPassword) {
    throw { status: 400, message: 'Password baru wajib diisi', code: 'MISSING_NEW_PASSWORD' };
  }

  if (newPassword.length < 6) {
    throw { status: 400, message: 'Password baru minimal 6 karakter', code: 'PASSWORD_TOO_SHORT' };
  }

  let session = null;

  // Jika verifikasi via link token
  if (token) {
    session = resetSessions.get(`token:${token}`);
    if (!session) {
      throw { status: 400, message: 'Tautan reset password tidak valid atau sudah kedaluwarsa', code: 'INVALID_TOKEN' };
    }
  } else if (identifier && otp) {
    // Jika verifikasi via kode OTP manual
    const query = identifier.trim();
    const pengguna = await prisma.pengguna.findFirst({
      where: {
        OR: [
          { username: query },
          { email: query },
        ],
      },
    });

    if (!pengguna) {
      throw { status: 404, message: 'Pengguna tidak ditemukan', code: 'USER_NOT_FOUND' };
    }

    session = resetSessions.get(pengguna.username);
    if (!session) {
      throw { status: 400, message: 'Kode OTP belum diminta atau sudah kedaluwarsa', code: 'OTP_NOT_FOUND' };
    }

    if (String(session.otp).trim() !== String(otp).trim()) {
      throw { status: 400, message: 'Kode OTP tidak cocok atau salah', code: 'INVALID_OTP' };
    }
  } else {
    throw { status: 400, message: 'Tautan atau kode OTP verifikasi wajib disertakan', code: 'MISSING_VERIFICATION' };
  }

  if (Date.now() > session.expiresAt) {
    if (session.username) resetSessions.delete(session.username);
    if (session.token) resetSessions.delete(`token:${session.token}`);
    throw { status: 400, message: 'Sesi reset password sudah kedaluwarsa. Silakan ajukan ulang.', code: 'SESSION_EXPIRED' };
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await prisma.pengguna.update({
    where: { id: session.userId },
    data: { password: hashedPassword },
  });

  // Bersihkan sesi
  if (session.username) resetSessions.delete(session.username);
  if (session.token) resetSessions.delete(`token:${session.token}`);

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
