// ============================================
// Konfigurasi Prisma Client — Singleton Instance
// ============================================
// Menggunakan pola singleton agar hanya ada 1 instance
// PrismaClient di seluruh aplikasi, menghindari
// koneksi database berlebihan

const { PrismaClient } = require('@prisma/client');

// Simpan instance di global agar tidak dibuat ulang saat hot-reload (nodemon)
const globalForPrisma = globalThis;

const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

module.exports = prisma;
