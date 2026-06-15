// ============================================
// Persediaan Controller — FinStocks
// ============================================

const persediaanService = require('./persediaan.service');
const { sendSuccess, sendPaginated, sendError, sendValidationError } = require('../../utils/response');
const { validationResult } = require('express-validator');

const getAll = async (req, res) => {
  try {
    const data = await persediaanService.getAll();
    return sendSuccess(res, 'Berhasil mengambil data persediaan', data);
  } catch (error) {
    return sendError(res, error.message, error.status || 500, error.code);
  }
};

const getById = async (req, res) => {
  try {
    const data = await persediaanService.getById(req.params.id);
    return sendSuccess(res, 'Berhasil mengambil detail persediaan', data);
  } catch (error) {
    return sendError(res, error.message, error.status || 500, error.code);
  }
};

const create = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendValidationError(res, errors.array());
    const data = await persediaanService.create(req.body, req.user?.id);
    return sendSuccess(res, 'Bahan baku berhasil ditambahkan', data, 201);
  } catch (error) {
    return sendError(res, error.message, error.status || 500, error.code);
  }
};

const update = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendValidationError(res, errors.array());
    const data = await persediaanService.update(req.params.id, req.body, req.user?.id);
    return sendSuccess(res, 'Bahan baku berhasil diperbarui', data);
  } catch (error) {
    return sendError(res, error.message, error.status || 500, error.code);
  }
};

const remove = async (req, res) => {
  try {
    await persediaanService.remove(req.params.id, req.user?.id);
    return sendSuccess(res, 'Bahan baku berhasil dihapus');
  } catch (error) {
    return sendError(res, error.message, error.status || 500, error.code);
  }
};

const restock = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendValidationError(res, errors.array());
    const data = await persediaanService.restock(req.params.id, req.body, req.user?.id);
    return sendSuccess(res, 'Restock berhasil', data);
  } catch (error) {
    return sendError(res, error.message, error.status || 500, error.code);
  }
};

const getRiwayat = async (req, res) => {
  try {
    const result = await persediaanService.getRiwayat(req.query);
    return sendPaginated(res, 'Berhasil mengambil riwayat aktivitas persediaan', result.data, result.pagination);
  } catch (error) {
    return sendError(res, error.message, error.status || 500, error.code);
  }
};

module.exports = { getAll, getById, create, update, remove, restock, getRiwayat };
