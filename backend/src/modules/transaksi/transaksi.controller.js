// ============================================
// Transaksi Controller — FinStocks
// ============================================

const transaksiService = require('./transaksi.service');
const { sendSuccess, sendPaginated, sendError, sendValidationError } = require('../../utils/response');
const { validationResult } = require('express-validator');

const getAll = async (req, res) => {
  try {
    const result = await transaksiService.getAll(req.query);
    return sendPaginated(res, 'Berhasil mengambil data transaksi', result.data, result.pagination);
  } catch (error) {
    return sendError(res, error.message, error.status || 500, error.code);
  }
};

const getById = async (req, res) => {
  try {
    const data = await transaksiService.getById(req.params.id);
    return sendSuccess(res, 'Berhasil mengambil detail transaksi', data);
  } catch (error) {
    return sendError(res, error.message, error.status || 500, error.code);
  }
};

const create = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendValidationError(res, errors.array());

    // Kasir ID dari token user yang login
    const kasirId = req.body.kasirId || req.user.id;
    const data = await transaksiService.create(req.body, kasirId);
    return sendSuccess(res, 'Transaksi berhasil disimpan', data, 201);
  } catch (error) {
    return sendError(res, error.message, error.status || 500, error.code);
  }
};

const updateStatus = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendValidationError(res, errors.array());

    const data = await transaksiService.updateStatus(req.params.id, req.body.status);
    return sendSuccess(res, 'Status transaksi berhasil diperbarui', data);
  } catch (error) {
    return sendError(res, error.message, error.status || 500, error.code);
  }
};

const remove = async (req, res) => {
  try {
    await transaksiService.remove(req.params.id);
    return sendSuccess(res, 'Transaksi berhasil dihapus');
  } catch (error) {
    return sendError(res, error.message, error.status || 500, error.code);
  }
};

module.exports = { getAll, getById, create, updateStatus, remove };
