// ============================================
// Menu Service — FinStocks
// ============================================
// Logika bisnis untuk manajemen menu (CRUD)

const prisma = require('../../config/db');

const getAll = async () => {
  return await prisma.menu.findMany({
    orderBy: { nama: 'asc' },
  });
};

const getById = async (id) => {
  const menu = await prisma.menu.findUnique({ where: { id: parseInt(id) } });
  if (!menu) {
    throw { status: 404, message: 'Menu tidak ditemukan', code: 'MENU_NOT_FOUND' };
  }
  return menu;
};

const create = async (data) => {
  return await prisma.menu.create({
    data: {
      nama: data.nama,
      kategori: data.kategori,
      harga: data.harga,
    },
  });
};

const update = async (id, data) => {
  await getById(id);
  const updateData = {};
  if (data.nama) updateData.nama = data.nama;
  if (data.kategori) updateData.kategori = data.kategori;
  if (data.harga !== undefined) updateData.harga = data.harga;
  if (data.isAvailable !== undefined) updateData.isAvailable = data.isAvailable;

  return await prisma.menu.update({
    where: { id: parseInt(id) },
    data: updateData,
  });
};

const remove = async (id) => {
  await getById(id);
  // Cek apakah menu masih dipakai di transaksi
  const usedInTransaksi = await prisma.itemTransaksi.findFirst({
    where: { menuId: parseInt(id) },
  });
  if (usedInTransaksi) {
    throw { status: 400, message: 'Menu tidak bisa dihapus karena masih terkait dengan transaksi', code: 'MENU_IN_USE' };
  }
  await prisma.menu.delete({ where: { id: parseInt(id) } });
  return true;
};

module.exports = { getAll, getById, create, update, remove };
