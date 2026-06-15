// ============================================
// Pengeluaran Service — FinStocks
// ============================================

const prisma = require('../../config/db');

/**
 * Get all pengeluaran with optional filters
 */
const getAllPengeluaran = async (query) => {
  const { startDate, endDate, kategori, search } = query;

  const where = {};

  // Filter tanggal
  if (startDate && endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    where.tanggal = {
      gte: new Date(startDate),
      lte: end,
    };
  }

  // Filter kategori
  if (kategori && kategori !== 'SEMUA') {
    where.kategori = kategori;
  }

  // Filter search (keterangan)
  if (search) {
    where.keterangan = {
      contains: search,
    }; // Sqlite doesn't support mode: 'insensitive' out of the box in prisma, so standard contains
  }

  const pengeluaran = await prisma.pengeluaran.findMany({
    where,
    include: { vendor: true },
    orderBy: { tanggal: 'desc' },
  });

  return pengeluaran;
};

/**
 * Get summary of pengeluaran (total this month vs last month)
 */
const getSummary = async () => {
  const now = new Date();
  
  // This month
  const startThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endThisMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  
  // Last month
  const startLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

  const [thisMonthAggr, lastMonthAggr, kategoriAggr] = await Promise.all([
    prisma.pengeluaran.aggregate({
      where: { tanggal: { gte: startThisMonth, lte: endThisMonth } },
      _sum: { jumlah: true },
    }),
    prisma.pengeluaran.aggregate({
      where: { tanggal: { gte: startLastMonth, lte: endLastMonth } },
      _sum: { jumlah: true },
    }),
    prisma.pengeluaran.groupBy({
      by: ['kategori'],
      where: { tanggal: { gte: startThisMonth, lte: endThisMonth } },
      _sum: { jumlah: true },
      orderBy: { _sum: { jumlah: 'desc' } }
    })
  ]);

  const totalBulanIni = Number(thisMonthAggr._sum.jumlah || 0);
  const totalBulanLalu = Number(lastMonthAggr._sum.jumlah || 0);

  // Kategori terbesar
  let kategoriTerbesar = { kategori: '-', jumlah: 0 };
  if (kategoriAggr.length > 0) {
    kategoriTerbesar = {
      kategori: kategoriAggr[0].kategori,
      jumlah: Number(kategoriAggr[0]._sum.jumlah || 0)
    };
  }

  return {
    totalBulanIni,
    totalBulanLalu,
    kategoriTerbesar
  };
};

/**
 * Get pengeluaran by ID
 */
const getPengeluaranById = async (id) => {
  const pengeluaran = await prisma.pengeluaran.findUnique({
    where: { id: parseInt(id) },
    include: { vendor: true },
  });

  if (!pengeluaran) {
    throw new Error('Data pengeluaran tidak ditemukan');
  }

  return pengeluaran;
};

/**
 * Create new pengeluaran
 */
const createPengeluaran = async (data) => {
  return await prisma.pengeluaran.create({
    data: {
      tanggal: data.tanggal ? new Date(data.tanggal) : new Date(),
      keterangan: data.keterangan,
      jumlah: parseFloat(data.jumlah),
      kategori: data.kategori || 'LAINNYA',
      vendorId: data.vendorId && data.vendorId !== 'null' ? parseInt(data.vendorId) : null,
      buktiUrl: data.buktiUrl || null,
    },
  });
};

/**
 * Update pengeluaran
 */
const updatePengeluaran = async (id, data) => {
  await getPengeluaranById(id); // Ensure exists

  return await prisma.pengeluaran.update({
    where: { id: parseInt(id) },
    data: {
      tanggal: data.tanggal ? new Date(data.tanggal) : undefined,
      keterangan: data.keterangan,
      jumlah: data.jumlah ? parseFloat(data.jumlah) : undefined,
      kategori: data.kategori,
      vendorId: data.vendorId !== undefined ? (data.vendorId && data.vendorId !== 'null' ? parseInt(data.vendorId) : null) : undefined,
      buktiUrl: data.buktiUrl || undefined,
    },
  });
};

/**
 * Delete pengeluaran
 */
const deletePengeluaran = async (id) => {
  await getPengeluaranById(id); // Ensure exists

  return await prisma.pengeluaran.delete({
    where: { id: parseInt(id) },
  });
};

module.exports = {
  getAllPengeluaran,
  getSummary,
  getPengeluaranById,
  createPengeluaran,
  updatePengeluaran,
  deletePengeluaran,
};
