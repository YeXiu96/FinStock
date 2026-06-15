// ============================================
// Transaksi Service — FinStocks
// ============================================
// Logika bisnis untuk manajemen transaksi penjualan

const prisma = require('../../config/db');

/**
 * Generate kode transaksi otomatis format #T-XXXX
 */
const generateKodeTransaksi = async () => {
  const lastTransaksi = await prisma.transaksi.findFirst({
    orderBy: { id: 'desc' },
  });

  let nextNumber = 1;
  if (lastTransaksi && lastTransaksi.kodeTransaksi) {
    const lastNumber = parseInt(lastTransaksi.kodeTransaksi.replace('#T-', ''));
    nextNumber = lastNumber + 1;
  }

  return `#T-${String(nextNumber).padStart(4, '0')}`;
};

/**
 * Ambil semua transaksi dengan filter dan pagination
 */
const getAll = async (query) => {
  const { page = 1, limit = 10, status, kasirId, metode, tanggalMulai, tanggalSelesai } = query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Bangun filter kondisional
  const where = {};
  if (status) where.status = status;
  if (kasirId) where.kasirId = parseInt(kasirId);
  if (metode) where.metode = metode;
  if (tanggalMulai || tanggalSelesai) {
    where.waktu = {};
    if (tanggalMulai) where.waktu.gte = new Date(tanggalMulai);
    if (tanggalSelesai) {
      const endDate = new Date(tanggalSelesai);
      endDate.setHours(23, 59, 59, 999);
      where.waktu.lte = endDate;
    }
  }

  const [data, total] = await Promise.all([
    prisma.transaksi.findMany({
      where,
      include: {
        kasir: { select: { id: true, nama: true, username: true } },
        items: { include: { menu: true } },
      },
      orderBy: { waktu: 'desc' },
      skip,
      take: parseInt(limit),
    }),
    prisma.transaksi.count({ where }),
  ]);

  return {
    data,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPage: Math.ceil(total / parseInt(limit)),
    },
  };
};

/**
 * Ambil detail transaksi berdasarkan ID
 */
const getById = async (id) => {
  const transaksi = await prisma.transaksi.findUnique({
    where: { id: parseInt(id) },
    include: {
      kasir: { select: { id: true, nama: true, username: true } },
      items: { include: { menu: true } },
    },
  });

  if (!transaksi) {
    throw { status: 404, message: 'Transaksi tidak ditemukan', code: 'TRANSACTION_NOT_FOUND' };
  }
  return transaksi;
};

/**
 * Buat transaksi baru
 */
const create = async (data, kasirId) => {
  // Generate kode transaksi otomatis
  const kodeTransaksi = await generateKodeTransaksi();

  // Hitung total dari items
  let total = 0;
  const itemsData = data.items.map((item) => {
    const subtotal = item.qty * item.hargaSatuan;
    total += subtotal;
    return {
      menuId: item.menuId,
      qty: item.qty,
      hargaSatuan: item.hargaSatuan,
      subtotal,
    };
  });

  // Buat transaksi beserta items-nya dalam satu operasi
  const transaksi = await prisma.transaksi.create({
    data: {
      kodeTransaksi,
      kasirId,
      total,
      metode: data.metode,
      status: data.status || 'SELESAI',
      catatan: data.catatan || null,
      namaPelanggan: data.namaPelanggan || null,
      items: { create: itemsData },
    },
    include: {
      kasir: { select: { id: true, nama: true, username: true } },
      items: { include: { menu: true } },
    },
  });

  return transaksi;
};

/**
 * Update status transaksi
 */
const updateStatus = async (id, status) => {
  await getById(id);

  return await prisma.transaksi.update({
    where: { id: parseInt(id) },
    data: { status },
    include: {
      kasir: { select: { id: true, nama: true, username: true } },
      items: { include: { menu: true } },
    },
  });
};

/**
 * Hapus (batalkan) transaksi
 */
const remove = async (id) => {
  await getById(id);

  // Hapus items terkait dulu, lalu transaksi (cascade sudah di schema tapi untuk safety)
  await prisma.transaksi.delete({ where: { id: parseInt(id) } });
  return true;
};

module.exports = { getAll, getById, create, updateStatus, remove };
