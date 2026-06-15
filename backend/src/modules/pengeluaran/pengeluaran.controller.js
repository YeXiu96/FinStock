// ============================================
// Pengeluaran Controller — FinStocks
// ============================================

const pengeluaranService = require('./pengeluaran.service');
const { sendSuccess, sendError } = require('../../utils/response');

const getAll = async (req, res) => {
  try {
    const data = await pengeluaranService.getAllPengeluaran(req.query);
    return sendSuccess(res, 'Berhasil mengambil data pengeluaran', data);
  } catch (error) {
    return sendError(res, 500, 'Gagal mengambil data pengeluaran', error.message);
  }
};

const getSummary = async (req, res) => {
  try {
    const data = await pengeluaranService.getSummary();
    return sendSuccess(res, 'Berhasil mengambil ringkasan pengeluaran', data);
  } catch (error) {
    return sendError(res, 500, 'Gagal mengambil ringkasan pengeluaran', error.message);
  }
};

const getById = async (req, res) => {
  try {
    const data = await pengeluaranService.getPengeluaranById(req.params.id);
    return sendSuccess(res, 'Berhasil mengambil detail pengeluaran', data);
  } catch (error) {
    if (error.message.includes('tidak ditemukan')) {
      return sendError(res, 404, error.message);
    }
    return sendError(res, 500, 'Gagal mengambil detail pengeluaran', error.message);
  }
};

const create = async (req, res) => {
  try {
    const { keterangan, jumlah, kategori, vendorId } = req.body;
    
    if (!keterangan || !jumlah) {
      return sendError(res, 400, 'Keterangan dan jumlah harus diisi');
    }

    const payload = { ...req.body };
    
    // Jika ada file bukti yang diupload
    if (req.file) {
      payload.buktiUrl = `/uploads/pengeluaran/${req.file.filename}`;
    }

    const data = await pengeluaranService.createPengeluaran(payload);
    return sendSuccess(res, 'Berhasil menambahkan pengeluaran', data, 201);
  } catch (error) {
    return sendError(res, 500, 'Gagal menambahkan pengeluaran', error.message);
  }
};

const update = async (req, res) => {
  try {
    const { keterangan, jumlah, vendorId } = req.body;
    
    if (!keterangan || !jumlah) {
      return sendError(res, 400, 'Keterangan dan jumlah harus diisi');
    }

    const payload = { ...req.body };

    // Jika ada file bukti yang diupload
    if (req.file) {
      payload.buktiUrl = `/uploads/pengeluaran/${req.file.filename}`;
    }

    const data = await pengeluaranService.updatePengeluaran(req.params.id, payload);
    return sendSuccess(res, 'Berhasil memperbarui pengeluaran', data);
  } catch (error) {
    if (error.message.includes('tidak ditemukan')) {
      return sendError(res, 404, error.message);
    }
    return sendError(res, 500, 'Gagal memperbarui pengeluaran', error.message);
  }
};

const remove = async (req, res) => {
  try {
    await pengeluaranService.deletePengeluaran(req.params.id);
    return sendSuccess(res, 'Berhasil menghapus pengeluaran');
  } catch (error) {
    if (error.message.includes('tidak ditemukan')) {
      return sendError(res, 404, error.message);
    }
    return sendError(res, 500, 'Gagal menghapus pengeluaran', error.message);
  }
};

module.exports = {
  getAll,
  getSummary,
  getById,
  create,
  update,
  remove,
};
