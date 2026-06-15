// ============================================
// Pengguna Controller — FinStocks
// ============================================

const penggunaService = require('./pengguna.service');
const { sendSuccess, sendError, sendValidationError } = require('../../utils/response');
const { validationResult } = require('express-validator');

const getAll = async (req, res) => {
  try {
    const data = await penggunaService.getAll();
    return sendSuccess(res, 'Berhasil mengambil data pengguna', data);
  } catch (error) {
    return sendError(res, error.message, error.status || 500, error.code);
  }
};

const getById = async (req, res) => {
  try {
    const data = await penggunaService.getById(req.params.id);
    return sendSuccess(res, 'Berhasil mengambil detail pengguna', data);
  } catch (error) {
    return sendError(res, error.message, error.status || 500, error.code);
  }
};

const create = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendValidationError(res, errors.array());

    const data = await penggunaService.create(req.body);
    return sendSuccess(res, 'Pengguna berhasil ditambahkan', data, 201);
  } catch (error) {
    return sendError(res, error.message, error.status || 500, error.code);
  }
};

const update = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendValidationError(res, errors.array());

    const data = await penggunaService.update(req.params.id, req.body);
    return sendSuccess(res, 'Pengguna berhasil diperbarui', data);
  } catch (error) {
    return sendError(res, error.message, error.status || 500, error.code);
  }
};

const remove = async (req, res) => {
  try {
    await penggunaService.remove(req.params.id);
    return sendSuccess(res, 'Pengguna berhasil dihapus');
  } catch (error) {
    return sendError(res, error.message, error.status || 500, error.code);
  }
};

const resetPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendValidationError(res, errors.array());

    await penggunaService.resetPassword(req.params.id, req.body.newPassword);
    return sendSuccess(res, 'Password berhasil direset');
  } catch (error) {
    return sendError(res, error.message, error.status || 500, error.code);
  }
};

module.exports = { getAll, getById, create, update, remove, resetPassword };
