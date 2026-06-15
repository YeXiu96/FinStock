// ============================================
// Seed Data — FinStocks
// ============================================
// Data awal untuk testing dan development:
// - 3 pengguna (1 Owner, 2 Karyawan)
// - 7 menu sesuai bisnis Mak Tunik
// - 6 bahan baku persediaan
// - Beberapa transaksi contoh
// - Beberapa pengeluaran operasional contoh

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Memulai seed data FinStocks...\n');

  // ============================================
  // 1. Seed Pengguna
  // ============================================
  console.log('👤 Membuat data pengguna...');

  const ownerPassword = await bcrypt.hash('owner123', 10);
  const karyawanPassword = await bcrypt.hash('karyawan123', 10);

  const owner = await prisma.pengguna.upsert({
    where: { username: 'owner' },
    update: {
      permissions: ["/", "/transaksi", "/kasir", "/pengeluaran", "/menu", "/persediaan", "/laporan", "/vendor", "/pengguna", "/pengaturan"],
    },
    create: {
      nama: 'Admin Owner',
      username: 'owner',
      password: ownerPassword,
      role: 'OWNER',
      permissions: ["/", "/transaksi", "/kasir", "/pengeluaran", "/menu", "/persediaan", "/laporan", "/vendor", "/pengguna", "/pengaturan"],
      status: 'AKTIF',
    },
  });

  const defaultKaryawanPermissions = ["/", "/kasir", "/transaksi", "/pengaturan"];

  const karyawan1 = await prisma.pengguna.upsert({
    where: { username: 'karyawan1' },
    update: {
      permissions: defaultKaryawanPermissions,
    },
    create: {
      nama: 'Budi Santoso',
      username: 'karyawan1',
      password: karyawanPassword,
      role: 'KARYAWAN',
      permissions: defaultKaryawanPermissions,
      status: 'AKTIF',
    },
  });

  const karyawan2 = await prisma.pengguna.upsert({
    where: { username: 'karyawan2' },
    update: {
      permissions: defaultKaryawanPermissions,
    },
    create: {
      nama: 'Sari Sulistyowati',
      username: 'karyawan2',
      password: karyawanPassword,
      role: 'KARYAWAN',
      permissions: defaultKaryawanPermissions,
      status: 'AKTIF',
    },
  });

  console.log(`   ✅ ${owner.nama} (Owner)`);
  console.log(`   ✅ ${karyawan1.nama} (Karyawan)`);
  console.log(`   ✅ ${karyawan2.nama} (Karyawan)\n`);

  // ============================================
  // 2. Seed Menu (sesuai bisnis Mak Tunik)
  // ============================================
  console.log('🍗 Membuat data menu...');

  const menuData = [
    { nama: 'Ayam Bakar', kategori: 'MAKANAN', harga: 25000 },
    { nama: 'Ceker Bakar', kategori: 'MAKANAN', harga: 15000 },
    { nama: 'Nasi Putih', kategori: 'MAKANAN', harga: 5000 },
    { nama: 'Es Teh Manis', kategori: 'MINUMAN', harga: 5000 },
    { nama: 'Es Jeruk', kategori: 'MINUMAN', harga: 8000 },
    { nama: 'Kopi Susu', kategori: 'MINUMAN', harga: 10000 },
    { nama: 'Jus Alpukat', kategori: 'MINUMAN', harga: 15000 },
  ];

  // Hapus data menu lama jika ada, lalu buat ulang
  await prisma.itemTransaksi.deleteMany();
  await prisma.menu.deleteMany();

  const menus = [];
  for (const item of menuData) {
    const menu = await prisma.menu.create({ data: item });
    menus.push(menu);
    console.log(`   ✅ ${menu.nama} - Rp ${Number(menu.harga).toLocaleString('id-ID')}`);
  }
  console.log('');

  // ============================================
  // 3. Seed Persediaan (Bahan Baku)
  // ============================================
  console.log('📦 Membuat data persediaan bahan baku...');

  const persediaanData = [
    { namaBahan: 'Ayam', kategori: 'BAHAN_POKOK', stok: 5, satuan: 'kg', stokMinimum: 2, status: 'AMAN' },
    { namaBahan: 'Tepung Terigu', kategori: 'BAHAN_POKOK', stok: 7.5, satuan: 'kg', stokMinimum: 3, status: 'AMAN' },
    { namaBahan: 'Minyak Goreng', kategori: 'BAHAN_POKOK', stok: 1, satuan: 'liter', stokMinimum: 1, status: 'KRITIS' },
    { namaBahan: 'Telur Ayam', kategori: 'BAHAN_POKOK', stok: 24, satuan: 'butir', stokMinimum: 12, status: 'AMAN' },
    { namaBahan: 'Kopi Bubuk', kategori: 'MINUMAN', stok: 0.5, satuan: 'kg', stokMinimum: 1, status: 'KRITIS' },
    { namaBahan: 'Susu UHT', kategori: 'MINUMAN', stok: 8, satuan: 'liter', stokMinimum: 4, status: 'AMAN' },
  ];

  await prisma.riwayatStok.deleteMany();
  await prisma.persediaan.deleteMany();

  for (const item of persediaanData) {
    const persediaan = await prisma.persediaan.create({ data: item });
    console.log(`   ✅ ${persediaan.namaBahan} — ${persediaan.stok} ${persediaan.satuan} [${persediaan.status}]`);
  }
  console.log('');

  // ============================================
  // 4. Seed Transaksi Contoh
  // ============================================
  console.log('💰 Membuat data transaksi contoh...');

  const transaksiData = [
    {
      kodeTransaksi: '#T-0001',
      kasirId: karyawan1.id,
      total: 55000,
      metode: 'TUNAI',
      status: 'SELESAI',
      catatan: 'Transaksi pertama',
      items: [
        { menuId: menus[0].id, qty: 2, hargaSatuan: 25000, subtotal: 50000 },
        { menuId: menus[2].id, qty: 1, hargaSatuan: 5000, subtotal: 5000 },
      ],
    },
    {
      kodeTransaksi: '#T-0002',
      kasirId: karyawan2.id,
      total: 38000,
      metode: 'QRIS',
      status: 'SELESAI',
      catatan: null,
      items: [
        { menuId: menus[1].id, qty: 1, hargaSatuan: 15000, subtotal: 15000 },
        { menuId: menus[2].id, qty: 1, hargaSatuan: 5000, subtotal: 5000 },
        { menuId: menus[4].id, qty: 1, hargaSatuan: 8000, subtotal: 8000 },
        { menuId: menus[5].id, qty: 1, hargaSatuan: 10000, subtotal: 10000 },
      ],
    },
    {
      kodeTransaksi: '#T-0003',
      kasirId: owner.id,
      total: 45000,
      metode: 'TRANSFER',
      status: 'SELESAI',
      catatan: 'Pesanan online',
      items: [
        { menuId: menus[0].id, qty: 1, hargaSatuan: 25000, subtotal: 25000 },
        { menuId: menus[2].id, qty: 1, hargaSatuan: 5000, subtotal: 5000 },
        { menuId: menus[6].id, qty: 1, hargaSatuan: 15000, subtotal: 15000 },
      ],
    },
  ];

  await prisma.transaksi.deleteMany();

  for (const trx of transaksiData) {
    const { items, ...trxData } = trx;
    const transaksi = await prisma.transaksi.create({
      data: {
        ...trxData,
        items: {
          create: items,
        },
      },
    });
    console.log(`   ✅ ${transaksi.kodeTransaksi} — Rp ${Number(transaksi.total).toLocaleString('id-ID')} [${transaksi.metode}]`);
  }
  console.log('');

  // ============================================
  // 5. Seed Pengeluaran Operasional Contoh
  // ============================================
  console.log('💸 Membuat data pengeluaran contoh...');

  await prisma.pengeluaran.deleteMany();

  const pengeluaranData = [
    { keterangan: 'Belanja bahan baku ayam', jumlah: 150000, kategori: 'Bahan Baku' },
    { keterangan: 'Bayar listrik bulan ini', jumlah: 85000, kategori: 'Listrik' },
    { keterangan: 'Beli gas elpiji 3kg x2', jumlah: 40000, kategori: 'Operasional' },
    { keterangan: 'Belanja bumbu dan rempah', jumlah: 65000, kategori: 'Bahan Baku' },
  ];

  for (const item of pengeluaranData) {
    const pengeluaran = await prisma.pengeluaran.create({ data: item });
    console.log(`   ✅ ${pengeluaran.keterangan} — Rp ${Number(pengeluaran.jumlah).toLocaleString('id-ID')}`);
  }
  console.log('');

  // ============================================
  // 6. Seed Log Aktivitas
  // ============================================
  console.log('📋 Membuat log aktivitas contoh...');

  await prisma.logAktivitas.deleteMany();

  const logData = [
    { penggunaId: owner.id, aksi: 'Login ke sistem' },
    { penggunaId: karyawan1.id, aksi: 'Login ke sistem' },
    { penggunaId: karyawan1.id, aksi: 'Membuat transaksi #T-0001' },
    { penggunaId: karyawan2.id, aksi: 'Login ke sistem' },
    { penggunaId: karyawan2.id, aksi: 'Membuat transaksi #T-0002' },
  ];

  for (const item of logData) {
    await prisma.logAktivitas.create({ data: item });
  }
  console.log(`   ✅ ${logData.length} log aktivitas berhasil dibuat\n`);

  // ============================================
  // Selesai
  // ============================================
  console.log('====================================');
  console.log('🎉 Seed data FinStocks selesai!');
  console.log('====================================');
  console.log(`   Pengguna  : 3 (1 Owner, 2 Karyawan)`);
  console.log(`   Menu      : ${menuData.length}`);
  console.log(`   Persediaan: ${persediaanData.length}`);
  console.log(`   Transaksi : ${transaksiData.length}`);
  console.log(`   Pengeluaran: ${pengeluaranData.length}`);
  console.log(`   Log       : ${logData.length}`);
  console.log('====================================\n');
  console.log('📌 Akun default:');
  console.log('   Owner    → username: owner / password: owner123');
  console.log('   Karyawan → username: karyawan1 / password: karyawan123');
  console.log('   Karyawan → username: karyawan2 / password: karyawan123\n');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error saat seeding:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
