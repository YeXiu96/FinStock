// ============================================
// Dashboard Controller — FinStocks
// ============================================

const dashboardService = require('./dashboard.service');
const { sendSuccess, sendError } = require('../../utils/response');

const getSummary = async (req, res) => {
  try {
    const data = await dashboardService.getSummary();
    return sendSuccess(res, 'Berhasil mengambil summary dashboard', data);
  } catch (error) {
    return sendError(res, error.message, error.status || 500);
  }
};

const getGrafik = async (req, res) => {
  try {
    const data = await dashboardService.getGrafik();
    return sendSuccess(res, 'Berhasil mengambil data grafik', data);
  } catch (error) {
    return sendError(res, error.message, error.status || 500);
  }
};

const getMenuTerlaris = async (req, res) => {
  try {
    const data = await dashboardService.getMenuTerlaris();
    return sendSuccess(res, 'Berhasil mengambil menu terlaris', data);
  } catch (error) {
    return sendError(res, error.message, error.status || 500);
  }
};

const getStokKritis = async (req, res) => {
  try {
    const data = await dashboardService.getStokKritis();
    return sendSuccess(res, 'Berhasil mengambil data stok kritis', data);
  } catch (error) {
    return sendError(res, error.message, error.status || 500);
  }
};

module.exports = { getSummary, getGrafik, getMenuTerlaris, getStokKritis };
