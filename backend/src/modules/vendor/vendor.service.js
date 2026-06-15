// ============================================
// Vendor Service — FinStocks
// ============================================
// Logika bisnis untuk manajemen vendor/supplier

const prisma = require('../../config/db');

// ============ VENDOR CRUD ============

const getAll = async () => {
  return await prisma.vendor.findMany({
    orderBy: { nama: 'asc' },
    include: {
      _count: {
        select: { produk: true }
      }
    }
  });
};

const getById = async (id) => {
  const vendor = await prisma.vendor.findUnique({
    where: { id: parseInt(id) },
    include: {
      produk: {
        orderBy: { namaProduk: 'asc' }
      },
      _count: {
        select: { produk: true }
      }
    }
  });
  if (!vendor) {
    throw { status: 404, message: 'Vendor tidak ditemukan', code: 'VENDOR_NOT_FOUND' };
  }
  return vendor;
};

const create = async (data) => {
  return await prisma.vendor.create({
    data: {
      nama: data.nama,
      alamat: data.alamat || null,
      telepon: data.telepon || null,
      email: data.email || null,
      catatan: data.catatan || null,
      status: data.status || 'AKTIF',
    },
  });
};

const update = async (id, data) => {
  await getById(id);
  const updateData = {};
  if (data.nama !== undefined) updateData.nama = data.nama;
  if (data.alamat !== undefined) updateData.alamat = data.alamat;
  if (data.telepon !== undefined) updateData.telepon = data.telepon;
  if (data.email !== undefined) updateData.email = data.email;
  if (data.catatan !== undefined) updateData.catatan = data.catatan;
  if (data.status !== undefined) updateData.status = data.status;

  return await prisma.vendor.update({
    where: { id: parseInt(id) },
    data: updateData,
  });
};

const remove = async (id) => {
  await getById(id);
  await prisma.vendor.delete({ where: { id: parseInt(id) } });
  return true;
};

// ============ PRODUK VENDOR CRUD ============

const getProdukByVendor = async (vendorId) => {
  await getById(vendorId); // pastikan vendor ada
  return await prisma.produkVendor.findMany({
    where: { vendorId: parseInt(vendorId) },
    orderBy: { namaProduk: 'asc' },
  });
};

const addProduk = async (vendorId, data) => {
  await getById(vendorId);
  return await prisma.produkVendor.create({
    data: {
      vendorId: parseInt(vendorId),
      namaProduk: data.namaProduk,
      harga: data.harga,
      satuan: data.satuan,
      keterangan: data.keterangan || null,
    },
  });
};

const updateProduk = async (vendorId, produkId, data) => {
  await getById(vendorId);
  const produk = await prisma.produkVendor.findFirst({
    where: { id: parseInt(produkId), vendorId: parseInt(vendorId) },
  });
  if (!produk) {
    throw { status: 404, message: 'Produk vendor tidak ditemukan', code: 'PRODUK_NOT_FOUND' };
  }

  const updateData = {};
  if (data.namaProduk !== undefined) updateData.namaProduk = data.namaProduk;
  if (data.harga !== undefined) updateData.harga = data.harga;
  if (data.satuan !== undefined) updateData.satuan = data.satuan;
  if (data.keterangan !== undefined) updateData.keterangan = data.keterangan;

  return await prisma.produkVendor.update({
    where: { id: parseInt(produkId) },
    data: updateData,
  });
};

const removeProduk = async (vendorId, produkId) => {
  await getById(vendorId);
  const produk = await prisma.produkVendor.findFirst({
    where: { id: parseInt(produkId), vendorId: parseInt(vendorId) },
  });
  if (!produk) {
    throw { status: 404, message: 'Produk vendor tidak ditemukan', code: 'PRODUK_NOT_FOUND' };
  }
  await prisma.produkVendor.delete({ where: { id: parseInt(produkId) } });
  return true;
};

module.exports = { getAll, getById, create, update, remove, getProdukByVendor, addProduk, updateProduk, removeProduk };
