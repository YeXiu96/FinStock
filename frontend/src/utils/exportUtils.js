// ============================================
// Export Utility — FinStocks
// ============================================
// Shared helper for exporting tables to Excel and PDF

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

/**
 * Export data ke file Excel (.xlsx) — diformat sebagai Excel Table
 * @param {Array<Object>} data - Array of row objects
 * @param {Array<{header: string, key: string}>} columns - Column definitions
 * @param {string} filename - Nama file tanpa ekstensi
 * @param {string} sheetName - Nama sheet (default: 'Data')
 */
export const exportToExcel = async (data, columns, filename, sheetName = 'Data') => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'FinStocks';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet(sheetName);

  // Build rows data
  const rows = data.map(row =>
    columns.map(col => col.format ? col.format(row[col.key], row) : (row[col.key] ?? '-'))
  );

  // Add as an Excel Table (Format as Table)
  worksheet.addTable({
    name: sheetName.replace(/[^a-zA-Z0-9]/g, '_'),
    ref: 'A1',
    headerRow: true,
    totalsRow: false,
    style: {
      theme: 'TableStyleMedium2',
      showRowStripes: true,
    },
    columns: columns.map(col => ({
      name: col.header,
      filterButton: true,
    })),
    rows,
  });

  // Style header row
  const headerRow = worksheet.getRow(1);
  headerRow.eachCell(cell => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3251' } };
    cell.alignment = { vertical: 'middle', horizontal: 'left' };
    cell.border = {
      bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
    };
  });
  headerRow.height = 24;

  // Style data rows
  for (let i = 2; i <= rows.length + 1; i++) {
    const row = worksheet.getRow(i);
    row.height = 20;
    row.eachCell(cell => {
      cell.font = { size: 10 };
      cell.alignment = { vertical: 'middle', horizontal: 'left' };
    });
  }

  // Auto-fit column widths
  worksheet.columns.forEach((col, idx) => {
    const header = columns[idx]?.header || '';
    const maxLen = Math.max(
      header.length,
      ...rows.map(r => String(r[idx] ?? '').length)
    );
    col.width = Math.min(maxLen + 4, 45);
  });

  // Generate and save
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  saveAs(blob, `${filename}.xlsx`);
};

/**
 * Export data ke file PDF (.pdf)
 * @param {Array<Object>} data - Array of row objects
 * @param {Array<{header: string, key: string}>} columns - Column definitions
 * @param {string} filename - Nama file tanpa ekstensi
 * @param {Object} options - Opsi tambahan
 * @param {string} options.title - Judul laporan
 * @param {string} options.orientation - 'portrait' | 'landscape'
 * @param {string} options.subtitle - Sub-judul opsional
 */
export const exportToPDF = (data, columns, filename, options = {}) => {
  const { title = 'Laporan FinStocks', orientation = 'landscape', subtitle = '' } = options;

  const doc = new jsPDF({ orientation, unit: 'mm', format: 'a4' });

  // Header
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 50, 81); // #1e3251
  doc.text(title, 14, 18);

  if (subtitle) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(107, 114, 128);
    doc.text(subtitle, 14, 25);
  }

  // Tanggal export
  const dateStr = new Date().toLocaleDateString('id-ID', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
  doc.setFontSize(8);
  doc.setTextColor(156, 163, 175);
  doc.text(`Diekspor: ${dateStr}`, 14, subtitle ? 31 : 25);

  // Table
  const head = [columns.map(col => col.header)];
  const body = data.map(row =>
    columns.map(col => col.format ? col.format(row[col.key], row) : String(row[col.key] ?? '-'))
  );

  autoTable(doc, {
    startY: subtitle ? 36 : 30,
    head,
    body,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 3,
      lineColor: [229, 231, 235],
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: [30, 50, 81],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'left',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: 14, right: 14 },
    didDrawPage: (data) => {
      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      doc.setFontSize(7);
      doc.setTextColor(156, 163, 175);
      doc.text(
        `Halaman ${data.pageNumber} dari ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 8,
        { align: 'center' }
      );
      doc.text(
        'FinStocks — Sistem Manajemen Keuangan & Persediaan',
        14,
        doc.internal.pageSize.getHeight() - 8,
      );
    },
  });

  doc.save(`${filename}.pdf`);
};

/**
 * Export struk/receipt transaksi ke PDF (format kecil 80mm)
 */
export const exportStrukPDF = (transaksi) => {
  const doc = new jsPDF({ unit: 'mm', format: [80, 200] });

  let y = 8;

  // Header toko
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('FinStocks', 40, y, { align: 'center' });
  y += 5;
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text('Struk Pembayaran', 40, y, { align: 'center' });
  y += 6;

  // Garis
  doc.setDrawColor(200);
  doc.setLineWidth(0.3);
  doc.line(5, y, 75, y);
  y += 4;

  // Info transaksi
  doc.setFontSize(7);
  doc.setTextColor(60);
  doc.text(`No: ${transaksi.kodeTransaksi}`, 5, y);
  y += 4;
  doc.text(`Tanggal: ${new Date(transaksi.waktu).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`, 5, y);
  y += 4;
  doc.text(`Kasir: ${transaksi.kasir?.nama || '-'}`, 5, y);
  y += 4;
  doc.text(`Metode: ${transaksi.metode}`, 5, y);
  y += 5;

  // Garis
  doc.line(5, y, 75, y);
  y += 4;

  // Items
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  (transaksi.items || []).forEach(item => {
    doc.setFont('helvetica', 'normal');
    const nama = item.menu?.nama || 'Item';
    const qty = item.qty || 1;
    const subtotal = Number(item.subtotal || 0);
    doc.text(nama, 5, y);
    doc.text(`${qty}x`, 50, y, { align: 'right' });
    doc.text(`Rp ${subtotal.toLocaleString('id-ID')}`, 75, y, { align: 'right' });
    y += 4;
  });

  y += 2;
  doc.line(5, y, 75, y);
  y += 5;

  // Total
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(30, 50, 81);
  doc.text('TOTAL', 5, y);
  doc.text(`Rp ${Number(transaksi.total || 0).toLocaleString('id-ID')}`, 75, y, { align: 'right' });
  y += 6;

  // Footer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(150);
  doc.text('Terima kasih atas kunjungan Anda!', 40, y, { align: 'center' });
  y += 4;
  doc.text('Barang yang sudah dibeli tidak dapat dikembalikan.', 40, y, { align: 'center' });

  doc.save(`struk_${transaksi.kodeTransaksi || transaksi.id}.pdf`);
};
