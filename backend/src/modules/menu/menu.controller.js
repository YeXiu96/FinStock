// ============================================
// Menu Controller — FinStocks
// ============================================

const menuService = require('./menu.service');
const { sendSuccess, sendError, sendValidationError } = require('../../utils/response');
const { validationResult } = require('express-validator');

const getAll = async (req, res) => {
  try {
    const data = await menuService.getAll();
    return sendSuccess(res, 'Berhasil mengambil data menu', data);
  } catch (error) {
    return sendError(res, error.message, error.status || 500, error.code);
  }
};

const getById = async (req, res) => {
  try {
    const data = await menuService.getById(req.params.id);
    return sendSuccess(res, 'Berhasil mengambil detail menu', data);
  } catch (error) {
    return sendError(res, error.message, error.status || 500, error.code);
  }
};

const create = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendValidationError(res, errors.array());
    const data = await menuService.create(req.body);
    return sendSuccess(res, 'Menu berhasil ditambahkan', data, 201);
  } catch (error) {
    return sendError(res, error.message, error.status || 500, error.code);
  }
};

const update = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendValidationError(res, errors.array());
    const data = await menuService.update(req.params.id, req.body);
    return sendSuccess(res, 'Menu berhasil diperbarui', data);
  } catch (error) {
    return sendError(res, error.message, error.status || 500, error.code);
  }
};

const remove = async (req, res) => {
  try {
    await menuService.remove(req.params.id);
    return sendSuccess(res, 'Menu berhasil dihapus');
  } catch (error) {
    return sendError(res, error.message, error.status || 500, error.code);
  }
};

module.exports = { getAll, getById, create, update, remove };
