// ============================================
// Persediaan Service — FinStocks
// ============================================
// Logika bisnis untuk manajemen persediaan bahan baku

const prisma = require('../../config/db');

/**
 * Hitung status stok otomatis berdasarkan perbandingan stok vs stokMinimum
 */
const hitungStatusStok = (stok, stokMinimum) => {
  const s = parseFloat(stok);
  const min = parseFloat(stokMinimum);
  if (s <= 0) return 'HABIS';
  if (s <= min) return 'KRITIS';
  return 'AMAN';
};

const getAll = async () => {
  return await prisma.persediaan.findMany({
    orderBy: { namaBahan: 'asc' },
  });
};

const getById = async (id) => {
  const persediaan = await prisma.persediaan.findUnique({
    where: { id: parseInt(id) },
    include: { riwayatStok: { orderBy: { tanggal: 'desc' }, take: 10 } },
  });
  if (!persediaan) {
    throw { status: 404, message: 'Bahan baku tidak ditemukan', code: 'STOCK_NOT_FOUND' };
  }
  return persediaan;
};

const create = async (data, userId) => {
  const status = hitungStatusStok(data.stok, data.stokMinimum);
  const persediaan = await prisma.persediaan.create({
    data: {
      namaBahan: data.namaBahan,
      kategori: data.kategori,
      stok: data.stok,
      satuan: data.satuan,
      stokMinimum: data.stokMinimum,
      hargaSatuan: data.hargaSatuan || 0,
      status,
    },
  });

  if (userId) {
    await prisma.logAktivitas.create({
      data: { penggunaId: userId, aksi: `[PERSEDIAAN] Menambah bahan baku baru: ${data.namaBahan}` }
    });
  }

  return persediaan;
};

const update = async (id, data, userId) => {
  const existing = await getById(id);
  const updateData = {};
  if (data.namaBahan) updateData.namaBahan = data.namaBahan;
  if (data.kategori) updateData.kategori = data.kategori;
  if (data.satuan) updateData.satuan = data.satuan;
  if (data.stok !== undefined) updateData.stok = data.stok;
  if (data.stokMinimum !== undefined) updateData.stokMinimum = data.stokMinimum;
  if (data.hargaSatuan !== undefined) updateData.hargaSatuan = data.hargaSatuan;

  // Hitung ulang status jika stok atau stokMinimum berubah
  const newStok = data.stok !== undefined ? data.stok : parseFloat(existing.stok);
  const newMin = data.stokMinimum !== undefined ? data.stokMinimum : parseFloat(existing.stokMinimum);
  updateData.status = hitungStatusStok(newStok, newMin);

  const updated = await prisma.persediaan.update({
    where: { id: parseInt(id) },
    data: updateData,
  });

  if (userId) {
    await prisma.logAktivitas.create({
      data: { penggunaId: userId, aksi: `[PERSEDIAAN] Mengedit data bahan baku: ${existing.namaBahan}` }
    });
  }

  return updated;
};

const remove = async (id, userId) => {
  const existing = await getById(id);
  await prisma.persediaan.delete({ where: { id: parseInt(id) } });

  if (userId) {
    await prisma.logAktivitas.create({
      data: { penggunaId: userId, aksi: `[PERSEDIAAN] Menghapus bahan baku: ${existing.namaBahan}` }
    });
  }

  return true;
};

/**
 * Input stok masuk (restock)
 */
const restock = async (id, data, userId) => {
  const existing = await getById(id);
  const newStok = parseFloat(existing.stok) + parseFloat(data.jumlah);
  const newStatus = hitungStatusStok(newStok, parseFloat(existing.stokMinimum));

  // Update stok dan status
  const updated = await prisma.persediaan.update({
    where: { id: parseInt(id) },
    data: { stok: newStok, status: newStatus },
  });

  // Catat riwayat stok masuk
  await prisma.riwayatStok.create({
    data: {
      persediaanId: parseInt(id),
      tipe: 'MASUK',
      jumlah: parseFloat(data.jumlah),
      keterangan: data.keterangan || 'Restock bahan baku',
    },
  });

  if (userId) {
    await prisma.logAktivitas.create({
      data: { penggunaId: userId, aksi: `[PERSEDIAAN] Restock +${data.jumlah} ${existing.satuan} pada: ${existing.namaBahan}` }
    });
  }

  return updated;
};

/**
 * Ambil riwayat stok (semua bahan atau per bahan)
 */
const getRiwayat = async (query) => {
  const { page = 1, limit = 20 } = query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  // Mengambil LogAktivitas spesifik persediaan 
  const where = { aksi: { startsWith: '[PERSEDIAAN]' } };

  const [data, total] = await Promise.all([
    prisma.logAktivitas.findMany({
      where,
      include: { pengguna: { select: { nama: true } } },
      orderBy: { waktu: 'desc' },
      skip,
      take: parseInt(limit),
    }),
    prisma.logAktivitas.count({ where }),
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

module.exports = { getAll, getById, create, update, remove, restock, getRiwayat };
