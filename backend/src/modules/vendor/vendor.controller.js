// ============================================
// Vendor Controller — FinStocks
// ============================================

const vendorService = require('./vendor.service');
const { sendSuccess, sendError, sendValidationError } = require('../../utils/response');
const { validationResult } = require('express-validator');

// ============ VENDOR ============

const getAll = async (req, res) => {
  try {
    const data = await vendorService.getAll();
    return sendSuccess(res, 'Berhasil mengambil data vendor', data);
  } catch (error) {
    return sendError(res, error.message, error.status || 500, error.code);
  }
};

const getById = async (req, res) => {
  try {
    const data = await vendorService.getById(req.params.id);
    return sendSuccess(res, 'Berhasil mengambil detail vendor', data);
  } catch (error) {
    return sendError(res, error.message, error.status || 500, error.code);
  }
};

const create = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendValidationError(res, errors.array());
    const data = await vendorService.create(req.body);
    return sendSuccess(res, 'Vendor berhasil ditambahkan', data, 201);
  } catch (error) {
    return sendError(res, error.message, error.status || 500, error.code);
  }
};

const update = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendValidationError(res, errors.array());
    const data = await vendorService.update(req.params.id, req.body);
    return sendSuccess(res, 'Vendor berhasil diperbarui', data);
  } catch (error) {
    return sendError(res, error.message, error.status || 500, error.code);
  }
};

const remove = async (req, res) => {
  try {
    await vendorService.remove(req.params.id);
    return sendSuccess(res, 'Vendor berhasil dihapus');
  } catch (error) {
    return sendError(res, error.message, error.status || 500, error.code);
  }
};

// ============ PRODUK VENDOR ============

const getProduk = async (req, res) => {
  try {
    const data = await vendorService.getProdukByVendor(req.params.id);
    return sendSuccess(res, 'Berhasil mengambil produk vendor', data);
  } catch (error) {
    return sendError(res, error.message, error.status || 500, error.code);
  }
};

const addProduk = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendValidationError(res, errors.array());
    const data = await vendorService.addProduk(req.params.id, req.body);
    return sendSuccess(res, 'Produk vendor berhasil ditambahkan', data, 201);
  } catch (error) {
    return sendError(res, error.message, error.status || 500, error.code);
  }
};

const updateProduk = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendValidationError(res, errors.array());
    const data = await vendorService.updateProduk(req.params.id, req.params.produkId, req.body);
    return sendSuccess(res, 'Produk vendor berhasil diperbarui', data);
  } catch (error) {
    return sendError(res, error.message, error.status || 500, error.code);
  }
};

const removeProduk = async (req, res) => {
  try {
    await vendorService.removeProduk(req.params.id, req.params.produkId);
    return sendSuccess(res, 'Produk vendor berhasil dihapus');
  } catch (error) {
    return sendError(res, error.message, error.status || 500, error.code);
  }
};

module.exports = { getAll, getById, create, update, remove, getProduk, addProduk, updateProduk, removeProduk };
