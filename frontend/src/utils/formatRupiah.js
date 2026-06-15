// ============================================
// Format Rupiah — FinStocks
// ============================================
// Konversi angka menjadi format mata uang Rupiah Indonesia
// Contoh: 25000 → "Rp 25.000"

/**
 * Format angka ke format Rupiah
 * @param {number} angka - Angka yang akan diformat
 * @returns {string} String dalam format Rupiah
 */
export const formatRupiah = (angka) => {
  if (angka === null || angka === undefined) return 'Rp 0';

  const number = Number(angka);
  if (isNaN(number)) return 'Rp 0';

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(number);
};

/**
 * Format angka ke format Rupiah singkat (untuk angka besar)
 * Contoh: 1500000 → "Rp 1,5 jt"
 * @param {number} angka - Angka yang akan diformat
 * @returns {string} String dalam format Rupiah singkat
 */
export const formatRupiahSingkat = (angka) => {
  const number = Number(angka);
  if (isNaN(number)) return 'Rp 0';

  if (number >= 1000000000) {
    return `Rp ${(number / 1000000000).toFixed(1)} M`;
  } else if (number >= 1000000) {
    return `Rp ${(number / 1000000).toFixed(1)} jt`;
  } else if (number >= 1000) {
    return `Rp ${(number / 1000).toFixed(1)} rb`;
  }
  return formatRupiah(number);
};
