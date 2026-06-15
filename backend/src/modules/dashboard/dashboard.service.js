// ============================================
// Dashboard Service — FinStocks
// ============================================
// Logika bisnis untuk dashboard: summary, grafik, menu terlaris, stok kritis

const prisma = require('../../config/db');

/**
 * Ambil summary dashboard hari ini
 * Total pendapatan, total transaksi, transaksi tunai, transaksi QRIS
 */
const getSummary = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const where = {
    waktu: { gte: today, lt: tomorrow },
    status: 'SELESAI',
  };

  // Total pendapatan hari ini
  const totalPendapatan = await prisma.transaksi.aggregate({
    where,
    _sum: { total: true },
  });

  // Total transaksi hari ini
  const totalTransaksi = await prisma.transaksi.count({ where });

  // Transaksi per metode
  const transaksiTunai = await prisma.transaksi.count({ where: { ...where, metode: 'TUNAI' } });
  const transaksiQris = await prisma.transaksi.count({ where: { ...where, metode: 'QRIS' } });

  return {
    totalPendapatan: totalPendapatan._sum.total || 0,
    totalTransaksi,
    transaksiTunai,
    transaksiQris,
  };
};

/**
 * Ambil data grafik pendapatan & pengeluaran 7 hari terakhir
 */
const getGrafik = async () => {
  const data = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);

    const pendapatan = await prisma.transaksi.aggregate({
      where: { waktu: { gte: date, lt: nextDate }, status: 'SELESAI' },
      _sum: { total: true },
    });

    const pengeluaran = await prisma.pengeluaran.aggregate({
      where: { tanggal: { gte: date, lt: nextDate } },
      _sum: { jumlah: true },
    });

    // Format nama hari dalam Bahasa Indonesia
    const namaHari = date.toLocaleDateString('id-ID', { weekday: 'short' });

    data.push({
      tanggal: date.toISOString().split('T')[0],
      hari: namaHari,
      pendapatan: Number(pendapatan._sum.total || 0),
      pengeluaran: Number(pengeluaran._sum.jumlah || 0),
    });
  }

  return data;
};

/**
 * Ambil top 5 menu terlaris
 */
const getMenuTerlaris = async () => {
  const result = await prisma.itemTransaksi.groupBy({
    by: ['menuId'],
    _sum: { qty: true },
    orderBy: { _sum: { qty: 'desc' } },
    take: 5,
  });

  // Ambil detail menu untuk setiap result
  const menuIds = result.map((r) => r.menuId);
  const menus = await prisma.menu.findMany({
    where: { id: { in: menuIds } },
  });

  return result.map((r) => {
    const menu = menus.find((m) => m.id === r.menuId);
    return {
      menuId: r.menuId,
      nama: menu?.nama || 'Unknown',
      kategori: menu?.kategori || 'Unknown',
      totalTerjual: r._sum.qty,
    };
  });
};

/**
 * Ambil bahan baku dengan stok kritis atau habis
 */
const getStokKritis = async () => {
  return await prisma.persediaan.findMany({
    where: { status: { in: ['KRITIS', 'HABIS'] } },
    orderBy: { stok: 'asc' },
  });
};

module.exports = { getSummary, getGrafik, getMenuTerlaris, getStokKritis };
