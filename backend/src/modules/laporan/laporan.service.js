// ============================================
// Laporan Service — FinStocks
// ============================================
// Logika bisnis untuk laporan keuangan + export PDF/Excel

const prisma = require('../../config/db');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

/**
 * Hitung laporan keuangan berdasarkan periode
 * @param {string} periode - harian/mingguan/bulanan/tahunan
 * @param {string} tanggal - tanggal referensi (ISO string)
 */
const getLaporanKeuangan = async (query) => {
  const { periode = 'harian', tanggal } = query;
  const refDate = tanggal ? new Date(tanggal) : new Date();

  // Tentukan range tanggal berdasarkan periode
  let startDate, endDate;

  switch (periode) {
    case 'harian':
      startDate = new Date(refDate);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      break;
    case 'mingguan':
      startDate = new Date(refDate);
      startDate.setDate(startDate.getDate() - startDate.getDay());
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 7);
      break;
    case 'bulanan':
      startDate = new Date(refDate.getFullYear(), refDate.getMonth(), 1);
      endDate = new Date(refDate.getFullYear(), refDate.getMonth() + 1, 1);
      break;
    case 'tahunan':
      startDate = new Date(refDate.getFullYear(), 0, 1);
      endDate = new Date(refDate.getFullYear() + 1, 0, 1);
      break;
    default:
      startDate = new Date(refDate);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
  }

  // Query data
  const whereTransaksi = {
    waktu: { gte: startDate, lt: endDate },
    status: 'SELESAI',
  };
  const wherePengeluaran = {
    tanggal: { gte: startDate, lt: endDate },
  };

  const [totalPendapatan, totalPengeluaran, totalTransaksi, transaksiList, pengeluaranList] = await Promise.all([
    prisma.transaksi.aggregate({ where: whereTransaksi, _sum: { total: true } }),
    prisma.pengeluaran.aggregate({ where: wherePengeluaran, _sum: { jumlah: true } }),
    prisma.transaksi.count({ where: whereTransaksi }),
    prisma.transaksi.findMany({
      where: whereTransaksi,
      include: {
        kasir: { select: { nama: true } },
        items: { include: { menu: { select: { nama: true, kategori: true } } } },
      },
      orderBy: { waktu: 'desc' },
    }),
    prisma.pengeluaran.findMany({
      where: wherePengeluaran,
      orderBy: { tanggal: 'desc' },
    }),
  ]);

  const pendapatan = Number(totalPendapatan._sum.total || 0);
  const pengeluaran = Number(totalPengeluaran._sum.jumlah || 0);
  const laba = pendapatan - pengeluaran;

  // Komposisi pendapatan per kategori
  const komposisi = {};
  transaksiList.forEach((trx) => {
    trx.items.forEach((item) => {
      const kat = item.menu.kategori;
      komposisi[kat] = (komposisi[kat] || 0) + Number(item.subtotal);
    });
  });

  const komposisiArray = Object.entries(komposisi).map(([kategori, total]) => ({
    kategori,
    total,
    persentase: pendapatan > 0 ? ((total / pendapatan) * 100).toFixed(1) : 0,
  }));

  return {
    periode,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    summary: { totalPendapatan: pendapatan, totalPengeluaran: pengeluaran, labaBersih: laba, totalTransaksi },
    komposisi: komposisiArray,
    transaksi: transaksiList,
    pengeluaran: pengeluaranList,
  };
};

/**
 * Export laporan ke PDF menggunakan pdfkit
 */
const exportPDF = async (query, res) => {
  const laporan = await getLaporanKeuangan(query);

  const doc = new PDFDocument({ margin: 50, size: 'A4' });

  // Set response headers untuk download
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=Laporan_FinStocks_${laporan.periode}.pdf`);
  doc.pipe(res);

  // Header dokumen
  doc.fontSize(20).font('Helvetica-Bold').text('FinStocks', { align: 'center' });
  doc.fontSize(12).font('Helvetica').text('Laporan Keuangan', { align: 'center' });
  doc.fontSize(10).text(`Periode: ${laporan.periode.charAt(0).toUpperCase() + laporan.periode.slice(1)}`, { align: 'center' });
  doc.moveDown();

  // Garis pemisah
  doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
  doc.moveDown();

  // Summary
  doc.fontSize(14).font('Helvetica-Bold').text('Ringkasan Keuangan');
  doc.moveDown(0.5);
  doc.fontSize(10).font('Helvetica');
  doc.text(`Total Pendapatan  : Rp ${laporan.summary.totalPendapatan.toLocaleString('id-ID')}`);
  doc.text(`Total Pengeluaran : Rp ${laporan.summary.totalPengeluaran.toLocaleString('id-ID')}`);
  doc.text(`Laba Bersih       : Rp ${laporan.summary.labaBersih.toLocaleString('id-ID')}`);
  doc.text(`Total Transaksi   : ${laporan.summary.totalTransaksi}`);
  doc.moveDown();

  // Tabel transaksi sederhana
  doc.fontSize(14).font('Helvetica-Bold').text('Detail Transaksi');
  doc.moveDown(0.5);
  doc.fontSize(9).font('Helvetica');

  // Header tabel
  const tableTop = doc.y;
  doc.font('Helvetica-Bold');
  doc.text('Kode', 50, tableTop, { width: 70 });
  doc.text('Tanggal', 120, tableTop, { width: 100 });
  doc.text('Kasir', 220, tableTop, { width: 100 });
  doc.text('Metode', 320, tableTop, { width: 70 });
  doc.text('Total', 390, tableTop, { width: 100, align: 'right' });
  doc.moveDown();

  doc.font('Helvetica');
  // Batasi 50 transaksi per halaman untuk performa
  const maxRows = Math.min(laporan.transaksi.length, 50);
  for (let i = 0; i < maxRows; i++) {
    const trx = laporan.transaksi[i];
    const y = doc.y;
    if (y > 700) { doc.addPage(); }
    doc.text(trx.kodeTransaksi, 50, doc.y, { width: 70 });
    const tgl = new Date(trx.waktu).toLocaleDateString('id-ID');
    doc.text(tgl, 120, doc.y - 12, { width: 100 });
    doc.text(trx.kasir.nama, 220, doc.y - 12, { width: 100 });
    doc.text(trx.metode, 320, doc.y - 12, { width: 70 });
    doc.text(`Rp ${Number(trx.total).toLocaleString('id-ID')}`, 390, doc.y - 12, { width: 100, align: 'right' });
    doc.moveDown(0.3);
  }

  doc.end();
};

/**
 * Export laporan ke Excel menggunakan exceljs
 */
const exportExcel = async (query, res) => {
  const laporan = await getLaporanKeuangan(query);

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'FinStocks';

  // Sheet 1: Ringkasan
  const summarySheet = workbook.addWorksheet('Ringkasan');
  summarySheet.columns = [
    { header: 'Keterangan', key: 'keterangan', width: 30 },
    { header: 'Nilai', key: 'nilai', width: 25 },
  ];
  summarySheet.addRow({ keterangan: 'Periode', nilai: laporan.periode });
  summarySheet.addRow({ keterangan: 'Total Pendapatan', nilai: laporan.summary.totalPendapatan });
  summarySheet.addRow({ keterangan: 'Total Pengeluaran', nilai: laporan.summary.totalPengeluaran });
  summarySheet.addRow({ keterangan: 'Laba Bersih', nilai: laporan.summary.labaBersih });
  summarySheet.addRow({ keterangan: 'Total Transaksi', nilai: laporan.summary.totalTransaksi });

  // Styling header
  summarySheet.getRow(1).font = { bold: true };
  summarySheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0EA5E9' } };
  summarySheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

  // Sheet 2: Detail Transaksi
  const trxSheet = workbook.addWorksheet('Transaksi');
  trxSheet.columns = [
    { header: 'Kode', key: 'kode', width: 15 },
    { header: 'Tanggal', key: 'tanggal', width: 20 },
    { header: 'Kasir', key: 'kasir', width: 20 },
    { header: 'Metode', key: 'metode', width: 12 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Total', key: 'total', width: 18 },
  ];

  laporan.transaksi.forEach((trx) => {
    trxSheet.addRow({
      kode: trx.kodeTransaksi,
      tanggal: new Date(trx.waktu).toLocaleString('id-ID'),
      kasir: trx.kasir.nama,
      metode: trx.metode,
      status: trx.status,
      total: Number(trx.total),
    });
  });

  trxSheet.getRow(1).font = { bold: true };
  trxSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0EA5E9' } };
  trxSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

  // Sheet 3: Pengeluaran
  const expSheet = workbook.addWorksheet('Pengeluaran');
  expSheet.columns = [
    { header: 'Tanggal', key: 'tanggal', width: 20 },
    { header: 'Keterangan', key: 'keterangan', width: 35 },
    { header: 'Kategori', key: 'kategori', width: 18 },
    { header: 'Jumlah', key: 'jumlah', width: 18 },
  ];

  laporan.pengeluaran.forEach((p) => {
    expSheet.addRow({
      tanggal: new Date(p.tanggal).toLocaleString('id-ID'),
      keterangan: p.keterangan,
      kategori: p.kategori,
      jumlah: Number(p.jumlah),
    });
  });

  expSheet.getRow(1).font = { bold: true };
  expSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0EA5E9' } };
  expSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

  // Kirim file ke response
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=Laporan_FinStocks_${laporan.periode}.xlsx`);

  await workbook.xlsx.write(res);
  res.end();
};

module.exports = { getLaporanKeuangan, exportPDF, exportExcel };
