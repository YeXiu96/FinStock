// ============================================
// Helper Format Response API — FinStocks
// ============================================
// Semua endpoint WAJIB menggunakan format response konsisten:
// { success: boolean, message: string, data: any }

/**
 * Response sukses standar
 * @param {object} res - Express response object
 * @param {string} message - Pesan sukses
 * @param {any} data - Data yang dikembalikan
 * @param {number} statusCode - HTTP status code (default: 200)
 */
const sendSuccess = (res, message, data = null, statusCode = 200) => {
  const response = {
    success: true,
    message,
  };

  if (data !== null) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

/**
 * Response sukses dengan pagination
 * @param {object} res - Express response object
 * @param {string} message - Pesan sukses
 * @param {array} data - Data array yang dikembalikan
 * @param {object} pagination - Info pagination { page, limit, total, totalPage }
 */
const sendPaginated = (res, message, data, pagination) => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination,
  });
};

/**
 * Response error standar
 * @param {object} res - Express response object
 * @param {string} message - Pesan error
 * @param {number} statusCode - HTTP status code (default: 500)
 * @param {string} errorCode - Kode error internal (opsional)
 */
const sendError = (res, message, statusCode = 500, errorCode = null) => {
  const response = {
    success: false,
    message,
  };

  if (errorCode) {
    response.error = errorCode;
  }

  return res.status(statusCode).json(response);
};

/**
 * Response error validasi (422)
 * @param {object} res - Express response object
 * @param {array} errors - Array error dari express-validator
 */
const sendValidationError = (res, errors) => {
  return res.status(422).json({
    success: false,
    message: 'Validasi gagal',
    error: 'VALIDATION_ERROR',
    details: errors,
  });
};

module.exports = {
  sendSuccess,
  sendPaginated,
  sendError,
  sendValidationError,
};
