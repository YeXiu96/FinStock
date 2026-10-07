// ============================================
// Entry Point Express Server — FinStocks
// ============================================

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');

// Muat environment variables dari file .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================
// Middleware Global
// ============================================

// Izinkan request dari frontend (CORS)
app.use(cors({
  origin: (origin, callback) => {
    // Izinkan request jika origin tidak ada (Postman, curl) atau FRONTEND_URL diset '*'
    if (!origin || !process.env.FRONTEND_URL || process.env.FRONTEND_URL === '*') {
      return callback(null, true);
    }
    const allowed = process.env.FRONTEND_URL.split(',').map(s => s.trim());
    if (allowed.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true
}));

// Parsing body request JSON
app.use(express.json());

// Parsing body request URL-encoded
app.use(express.urlencoded({ extended: true }));

// Logging request HTTP (hanya di development)
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Menyediakan folder uploads secara statis agar bisa diakses public
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ============================================
// Rute Utama
// ============================================

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'FinStocks API berjalan dengan baik',
    data: {
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString()
    }
  });
});

// ============================================
// Registrasi Route Modules
// ============================================
const authRoutes = require('./modules/auth/auth.routes');
const transaksiRoutes = require('./modules/transaksi/transaksi.routes');
const persediaanRoutes = require('./modules/persediaan/persediaan.routes');
const laporanRoutes = require('./modules/laporan/laporan.routes');
const penggunaRoutes = require('./modules/pengguna/pengguna.routes');
const dashboardRoutes = require('./modules/dashboard/dashboard.routes');
const menuRoutes = require('./modules/menu/menu.routes');
const vendorRoutes = require('./modules/vendor/vendor.routes');
const pengeluaranRoutes = require('./modules/pengeluaran/pengeluaran.routes');

app.use('/api/auth', authRoutes);
app.use('/api/transaksi', transaksiRoutes);
app.use('/api/persediaan', persediaanRoutes);
app.use('/api/laporan', laporanRoutes);
app.use('/api/pengguna', penggunaRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/vendor', vendorRoutes);
app.use('/api/pengeluaran', pengeluaranRoutes);

// ============================================
// Middleware Penanganan Error Global
// ============================================

// Tangani route yang tidak ditemukan (404)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} tidak ditemukan`,
    error: 'NOT_FOUND'
  });
});

// Tangani error internal server (500)
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Terjadi kesalahan pada server',
    error: 'INTERNAL_SERVER_ERROR'
  });
});

// ============================================
// Jalankan Server
// ============================================

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`
    ====================================
    🍗 FinStocks API Server
    ====================================
    Status  : Berjalan
    Port    : ${PORT}
    Mode    : ${process.env.NODE_ENV || 'development'}
    URL     : http://localhost:${PORT}
    Health  : http://localhost:${PORT}/api/health
    ====================================
    `);
  });
}

module.exports = app;
