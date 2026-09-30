# 🍗 FinStocks — Sistem Informasi Manajemen Keuangan & Persediaan

> Aplikasi web modern untuk UMKM **Mak Tunik** (Gerai Ayam Bakar) untuk digitalisasi pencatatan transaksi kasir, pemantauan stok bahan baku, manajemen vendor, pengelolaan pengeluaran operasional, dan pembuatan laporan keuangan otomatis.

---

## 📋 Deskripsi Proyek

**FinStocks** adalah sistem manajemen terpadu berbasis web yang dirancang khusus untuk meningkatkan efisiensi operasional bisnis kuliner Mak Tunik. Aplikasi ini menyelesaikan masalah pencatatan manual yang rentan kesalahan dengan menyediakan platform digital terpusat yang aman dan mudah digunakan.

### ✨ Fitur Utama

- **📊 Dashboard Analitik**: Grafik tren penjualan 7 hari terakhir, ringkasan pendapatan & pengeluaran harian, daftar bahan baku dengan status stok kritis, serta daftar menu terlaris.
- **🛒 POS Kasir (Point of Sales)**: Input transaksi penjualan cepat dengan pilihan menu dinamis, input nama pelanggan, catatan tambahan, dan opsi metode pembayaran (Tunai, QRIS, Transfer).
- **📦 Manajemen Persediaan & Bahan Baku**: Pemantauan level stok bahan baku secara real-time, pengaturan stok minimum (safety stock), riwayat mutasi stok (masuk/keluar), dan alert status otomatis (Aman/Kritis/Habis).
- **🤝 Manajemen Vendor & Supplier**: Database vendor yang menyuplai bahan baku beserta katalog harga produk yang ditawarkan untuk memudahkan restock.
- **💸 Pencatatan Pengeluaran**: Manajemen biaya operasional harian yang terintegrasi dengan vendor (opsional) lengkap dengan fitur unggah bukti kuitansi/transaksi.
- **📈 Laporan Keuangan Otomatis**: Rekap laba rugi bersih per periode, visualisasi keuangan, serta ekspor laporan ke format **PDF** dan **Excel**.
- **🔒 Akses Kontrol Berbasis Peran (RBAC)**:
  - **OWNER**: Akses penuh ke seluruh fitur (Persediaan, Vendor, Pengguna, Pengeluaran, Laporan Keuangan, & Reset Password).
  - **KARYAWAN**: Akses terbatas hanya untuk modul POS Kasir dan daftar menu.

---

## 🛠️ Tech Stack & Library Pendukung

### Frontend (Client-side)
* **Framework**: React 19 (Vite)
* **Styling**: Tailwind CSS v3
* **State Management**: Zustand
* **Icons**: Lucide React
* **Charts**: Recharts (Visualisasi grafik analitik)
* **HTTP Client**: Axios
* **Formatting**: Date-fns (Tanggal)

### Backend (Server-side)
* **Platform**: Node.js & Express v5
* **ORM**: Prisma Client v5 (Database access layer)
* **Database**: MySQL v8
* **Authentication**: JSON Web Token (JWT) & Bcryptjs (Hashing password)
* **Utilities**: Multer (Upload bukti pengeluaran), Morgan (HTTP logger), Express Validator (Validasi input payload)
* **Export**: PDFKit (Export laporan PDF), ExcelJS (Export laporan Excel)

---

## 🚀 Panduan Memulai (Setup Development)

### 📋 Prasyarat Sistem
* Node.js v20.x atau versi terbaru
* MySQL Server berjalan di mesin lokal (Default port: `3306`)
* Package Manager `npm` (Bawaan Node.js)

### 1. Kloning Repository
```bash
git clone <repo-url>
cd finstocks
```

### 2. Konfigurasi Environment Variables
Salin file template [.env.example](file:///d:/FInStock/.env.example) di root direktori menjadi file `.env` di masing-masing direktori `backend` dan `frontend` atau gunakan file terpusat:
- **Backend (.env)**: Lihat template di [backend/.env.example](file:///d:/FInStock/backend/.env.example)
- **Frontend (.env)**: Lihat template di [frontend/.env.example](file:///d:/FInStock/frontend/.env.example)

### 3. Setup Backend & Database
1. Buka terminal baru dan masuk ke direktori backend:
   ```bash
   cd backend
   ```
2. Instal semua dependensi Node.js:
   ```bash
   npm install
   ```
3. Konfigurasikan koneksi database di file `.env` (isi `DATABASE_URL` dengan username & password MySQL lokal Anda). Contoh:
   ```env
   DATABASE_URL="mysql://root:password@localhost:3306/finstocks_db"
   ```
4. Buat database di MySQL lokal:
   ```sql
   CREATE DATABASE finstocks_db;
   ```
5. Jalankan migrasi Prisma untuk membuat tabel secara otomatis:
   ```bash
   npx prisma migrate dev --name init
   ```
6. Masukkan data dummy awal (seeding user, menu, persediaan, vendor):
   ```bash
   npm run seed
   ```
7. Jalankan server backend dalam mode pengembangan:
   ```bash
   npm run dev
   ```
   Server backend kini berjalan di [http://localhost:5000](http://localhost:5000).

### 4. Setup Frontend
1. Buka terminal baru dan masuk ke direktori frontend:
   ```bash
   cd frontend
   ```
2. Instal semua dependensi React:
   ```bash
   npm install
   ```
3. Jalankan server pengembangan frontend:
   ```bash
   npm run dev
   ```
   Aplikasi frontend kini berjalan di [http://localhost:5173](http://localhost:5173).

---

## 🔑 Kredensial Akun Default (Hasil Seed)

Setelah menjalankan `npm run seed`, Anda dapat login menggunakan akun berikut:

| Username | Password | Role | Akses Fitur |
| :--- | :--- | :--- | :--- |
| `owner` | `owner123` | **OWNER** | Seluruh Sistem (Akses Penuh) |
| `karyawan1` | `karyawan123` | **KARYAWAN** | POS Kasir & Riwayat Transaksi |
| `karyawan2` | `karyawan123` | **KARYAWAN** | POS Kasir & Riwayat Transaksi |

---

## 📁 Struktur Folder Proyek

```text
finstocks/
├── backend/
│   ├── prisma/
│   │   ├── [schema.prisma](file:///d:/FInStock/backend/prisma/schema.prisma)   # Definisi skema database & relasi tabel
│   │   └── [seed.js](file:///d:/FInStock/backend/prisma/seed.js)         # Script memasukkan data awal
│   ├── src/
│   │   ├── config/        # Koneksi database & konfigurasi pihak ketiga
│   │   ├── middlewares/   # Auth middleware (JWT verification) & Role validation
│   │   ├── modules/       # Struktur Modular per Fitur (Controller, Routes, Service)
│   │   │   ├── auth/
│   │   │   ├── dashboard/
│   │   │   ├── laporan/
│   │   │   ├── menu/
│   │   │   ├── pengeluaran/
│   │   │   ├── pengguna/
│   │   │   ├── persediaan/
│   │   │   ├── transaksi/
│   │   │   └── vendor/
│   │   ├── utils/         # Helper respon API & token generator
│   │   └── [index.js](file:///d:/FInStock/backend/src/index.js)        # Entry point Express.js
│   ├── [package.json](file:///d:/FInStock/backend/package.json)
│   └── Dockerfile
└── frontend/
    ├── src/
    │   ├── api/           # Instance Axios & request helper ke backend
    │   ├── components/    # Reusable UI components & Layout (Sidebar/Navbar)
    │   ├── pages/         # Komponen halaman/views utama (Dashboard, POS, Laporan)
    │   ├── store/         # Manajemen state autentikasi menggunakan Zustand
    │   └── utils/         # Helper format Rupiah & parsing tanggal
    ├── [package.json](file:///d:/FInStock/frontend/package.json)
    └── vercel.json
```

---

## 🔌 Dokumentasi API Endpoints

Semua request API menggunakan prefix url `/api` (contoh: `http://localhost:5000/api/auth/login`).

### 🔐 Autentikasi (`/api/auth`)
- **POST** `/login` — Melakukan login pengguna & mengembalikan token JWT. *(Public)*
- **GET** `/me` — Mengambil data detail profil pengguna yang sedang login. *(Akses: OWNER, KARYAWAN)*
- **POST** `/logout` — Menghapus sesi login. *(Akses: OWNER, KARYAWAN)*

### 📊 Dashboard (`/api/dashboard`)
- **GET** `/summary` — Mengambil ringkasan data harian (Penjualan, Pengeluaran, Stok Kritis). *(Akses: OWNER, KARYAWAN)*
- **GET** `/grafik` — Mengambil data statistik grafik penjualan 7 hari terakhir. *(Akses: OWNER, KARYAWAN)*
- **GET** `/menu-terlaris` — Mengambil daftar 5 menu paling laku terjual. *(Akses: OWNER, KARYAWAN)*
- **GET** `/stok-kritis` — Mengambil daftar bahan baku yang berada di bawah ambang batas stok minimum. *(Akses: OWNER, KARYAWAN)*

### 🛍️ Transaksi (`/api/transaksi`)
- **GET** `/` — Mengambil daftar semua transaksi penjualan (bisa dengan filter tanggal). *(Akses: OWNER, KARYAWAN)*
- **POST** `/` — Membuat transaksi penjualan baru (Point of Sales). *(Akses: OWNER, KARYAWAN)*
- **GET** `/:id` — Mengambil detail spesifik transaksi & item terjual. *(Akses: OWNER, KARYAWAN)*
- **PUT** `/:id` — Mengubah detail transaksi. *(Akses: OWNER)*
- **DELETE** `/:id` — Menghapus data transaksi. *(Akses: OWNER)*
- **PUT** `/:id/status` — Memperbarui status transaksi (SELESAI/PENDING/BATAL). *(Akses: OWNER)*

### 📦 Persediaan & Bahan Baku (`/api/persediaan`)
- **GET** `/` — Mengambil semua daftar bahan baku di gudang. *(Akses: OWNER, KARYAWAN)*
- **POST** `/` — Menambahkan item bahan baku baru. *(Akses: OWNER)*
- **PUT** `/:id` — Mengubah informasi bahan baku (nama, safety stock, dll). *(Akses: OWNER)*
- **DELETE** `/:id` — Menghapus bahan baku dari database. *(Akses: OWNER)*
- **POST** `/:id/restock` — Menambahkan jumlah stok masuk untuk bahan tertentu. *(Akses: OWNER)*
- **GET** `/riwayat` — Melihat daftar riwayat mutasi stok masuk/keluar. *(Akses: OWNER)*

### 🥦 Menu Makanan & Minuman (`/api/menu`)
- **GET** `/` — Mengambil daftar seluruh menu ayam bakar & minuman. *(Akses: OWNER, KARYAWAN)*
- **POST** `/` — Menambahkan menu jualan baru. *(Akses: OWNER)*
- **PUT** `/:id` — Mengedit detail menu (nama, harga, kategori, ketersediaan). *(Akses: OWNER)*
- **DELETE** `/:id` — Menghapus menu dari katalog jualan. *(Akses: OWNER)*

### 🤝 Manajemen Vendor (`/api/vendor`)
- **GET** `/` — Mengambil daftar seluruh vendor yang terdaftar. *(Akses: OWNER)*
- **POST** `/` — Menambahkan data vendor baru. *(Akses: OWNER)*
- **GET** `/:id` — Melihat detail data vendor beserta daftar produknya. *(Akses: OWNER)*
- **PUT** `/:id` — Memperbarui data informasi kontak vendor. *(Akses: OWNER)*
- **DELETE** `/:id` — Menghapus data vendor. *(Akses: OWNER)*
- **GET** `/:id/produk` — Mengambil daftar katalog produk yang dipasok oleh vendor. *(Akses: OWNER)*
- **POST** `/:id/produk` — Menambahkan produk baru ke dalam daftar pasokan vendor. *(Akses: OWNER)*
- **PUT** `/:id/produk/:produkId` — Mengedit detail produk pasokan vendor (harga, satuan, dll). *(Akses: OWNER)*
- **DELETE** `/:id/produk/:produkId` — Menghapus produk dari vendor tersebut. *(Akses: OWNER)*

### 💸 Pengeluaran Operasional (`/api/pengeluaran`)
- **GET** `/` — Mengambil daftar transaksi pengeluaran operasional. *(Akses: OWNER)*
- **GET** `/summary` — Melihat rekap total pengeluaran. *(Akses: OWNER)*
- **GET** `/:id` — Mengambil detail pengeluaran tertentu. *(Akses: OWNER)*
- **POST** `/` — Mencatat pengeluaran baru (mendukung upload berkas/bukti dengan Multer). *(Akses: OWNER)*
- **PUT** `/:id` — Memperbarui data pengeluaran (termasuk mengganti bukti kuitansi). *(Akses: OWNER)*
- **DELETE** `/:id` — Menghapus pencatatan pengeluaran. *(Akses: OWNER)*

### 📈 Laporan Keuangan (`/api/laporan`)
- **GET** `/keuangan` — Mendapatkan data laba rugi bersih per periode tanggal tertentu. *(Akses: OWNER)*
- **GET** `/export/pdf` — Mengunduh laporan keuangan dalam format PDF. *(Akses: OWNER)*
- **GET** `/export/excel` — Mengunduh laporan keuangan dalam format file spreadsheet Excel (.xlsx). *(Akses: OWNER)*

### 👥 Pengaturan Pengguna (`/api/pengguna`)
- **GET** `/` — Mengambil seluruh daftar pengguna/karyawan yang terdaftar. *(Akses: OWNER)*
- **POST** `/` — Membuat akun pengguna baru. *(Akses: OWNER)*
- **PUT** `/:id` — Mengedit nama, role, atau hak akses modul pengguna. *(Akses: OWNER)*
- **DELETE** `/:id` — Menghapus akun pengguna dari sistem. *(Akses: OWNER)*
- **PUT** `/:id/reset-password` — Mengganti kata sandi pengguna terpilih. *(Akses: OWNER)*

---

## 🚢 Panduan Deployment Produksi

### Frontend ke Vercel
1. Pastikan kode terbaru sudah di-push ke repository GitHub.
2. Masuk ke [Vercel Console](https://vercel.com) dan impor project Anda.
3. Atur konfigurasi build sebagai berikut:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Tambahkan Environment Variable:
   - `VITE_API_BASE_URL` = (Diisi dengan URL Backend API produksi Anda, contoh: `https://api.finstocks.com/api`)
5. Klik **Deploy**.

### Backend ke Railway / Render
1. Daftarkan repository Anda di platform cloud (contoh: [Railway](https://railway.app)).
2. Atur **Root Directory** ke `backend`.
3. Gunakan MySQL add-on pada platform (atau database cloud eksternal seperti Aiven/PlanetScale).
4. Masukkan Environment Variables berikut pada dashboard cloud Anda:
   - `DATABASE_URL` = Koneksi database MySQL cloud Anda
   - `JWT_SECRET` = String acak unik untuk enkripsi token keamanan JWT
   - `JWT_EXPIRES_IN` = `8h`
   - `NODE_ENV` = `production`
   - `FRONTEND_URL` = URL domain frontend Vercel Anda (untuk perizinan CORS)
5. Simpan dan jalankan deployment.

---

## 📄 Lisensi & Hak Cipta

* Hak Cipta © 2026 milik **UMKM Mak Tunik**.
* Dikembangkan oleh **Kelompok 11 — Mata Kuliah MPPL (Manajemen Proyek Perangkat Lunak)**, Universitas Muhammadiyah Malang (UMM).
