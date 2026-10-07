// ============================================
// Pengguna Service — FinStocks
// ============================================
// Logika bisnis untuk manajemen pengguna (CRUD + reset password)

const prisma = require('../../config/db');
const bcrypt = require('bcryptjs');

/**
 * Ambil semua pengguna (tanpa password)
 */
const getAll = async () => {
  const pengguna = await prisma.pengguna.findMany({
    select: {
      id: true, nama: true, username: true, role: true,
      permissions: true, status: true, createdAt: true, updatedAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });
  return pengguna;
};

/**
 * Ambil pengguna berdasarkan ID
 */
const getById = async (id) => {
  const pengguna = await prisma.pengguna.findUnique({
    where: { id: parseInt(id) },
    select: {
      id: true, nama: true, username: true, role: true,
      permissions: true, status: true, createdAt: true, updatedAt: true,
    },
  });
  if (!pengguna) {
    throw { status: 404, message: 'Pengguna tidak ditemukan', code: 'USER_NOT_FOUND' };
  }
  return pengguna;
};

/**
 * Tambah pengguna baru
 */
const create = async (data) => {
  // Cek apakah username sudah ada
  const existing = await prisma.pengguna.findUnique({
    where: { username: data.username },
  });
  if (existing) {
    throw { status: 400, message: 'Username sudah digunakan', code: 'USERNAME_EXISTS' };
  }

  // Cek jika email disediakan dan sudah dipakai
  if (data.email) {
    const existingEmail = await prisma.pengguna.findUnique({
      where: { email: data.email },
    });
    if (existingEmail) {
      throw { status: 400, message: 'Email sudah digunakan oleh akun lain', code: 'EMAIL_EXISTS' };
    }
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(data.password, 10);

  const pengguna = await prisma.pengguna.create({
    data: {
      nama: data.nama,
      username: data.username,
      email: data.email || null,
      password: hashedPassword,
      role: data.role || 'KARYAWAN',
      permissions: data.permissions || [],
      status: data.status || 'AKTIF',
    },
  });

  // Return tanpa password
  const { password: _, ...userData } = pengguna;
  return userData;
};

/**
 * Update data pengguna
 */
const update = async (id, data) => {
  // Cek pengguna ada
  await getById(id);

  // Jika username diubah, cek unik
  if (data.username) {
    const existing = await prisma.pengguna.findFirst({
      where: { username: data.username, NOT: { id: parseInt(id) } },
    });
    if (existing) {
      throw { status: 400, message: 'Username sudah digunakan', code: 'USERNAME_EXISTS' };
    }
  }

  // Jika email diubah, cek unik
  if (data.email) {
    const existingEmail = await prisma.pengguna.findFirst({
      where: { email: data.email, NOT: { id: parseInt(id) } },
    });
    if (existingEmail) {
      throw { status: 400, message: 'Email sudah digunakan oleh akun lain', code: 'EMAIL_EXISTS' };
    }
  }

  const updateData = {};
  if (data.nama) updateData.nama = data.nama;
  if (data.username) updateData.username = data.username;
  if (data.email !== undefined) updateData.email = data.email || null;
  if (data.role) updateData.role = data.role;
  if (data.permissions !== undefined) updateData.permissions = data.permissions;
  if (data.status) updateData.status = data.status;

  const pengguna = await prisma.pengguna.update({
    where: { id: parseInt(id) },
    data: updateData,
  });

  const { password: _, ...userData } = pengguna;
  return userData;
};

/**
 * Hapus pengguna
 */
const remove = async (id) => {
  await getById(id);

  // Hapus log aktivitas terkait terlebih dahulu
  await prisma.logAktivitas.deleteMany({ where: { penggunaId: parseInt(id) } });

  await prisma.pengguna.delete({ where: { id: parseInt(id) } });
  return true;
};

/**
 * Reset password pengguna
 */
const resetPassword = async (id, newPassword) => {
  await getById(id);

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await prisma.pengguna.update({
    where: { id: parseInt(id) },
    data: { password: hashedPassword },
  });

  return true;
};

module.exports = { getAll, getById, create, update, remove, resetPassword };
