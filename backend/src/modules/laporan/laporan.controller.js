// ============================================
// Laporan Controller — FinStocks
// ============================================

const laporanService = require('./laporan.service');
const { sendSuccess, sendError } = require('../../utils/response');

const getKeuangan = async (req, res) => {
  try {
    const data = await laporanService.getLaporanKeuangan(req.query);
    return sendSuccess(res, 'Berhasil mengambil laporan keuangan', data);
  } catch (error) {
    return sendError(res, error.message, error.status || 500);
  }
};

const exportPDF = async (req, res) => {
  try {
    await laporanService.exportPDF(req.query, res);
  } catch (error) {
    return sendError(res, error.message, error.status || 500);
  }
};

const exportExcel = async (req, res) => {
  try {
    await laporanService.exportExcel(req.query, res);
  } catch (error) {
    return sendError(res, error.message, error.status || 500);
  }
};

module.exports = { getKeuangan, exportPDF, exportExcel };
