# 🍗 FinStocks — Sistem Informasi Manajemen Keuangan & Persediaan

> Aplikasi web untuk UMKM **Mak Tunik** yang mendigitalisasi pencatatan transaksi, monitoring stok bahan baku, dan pembuatan laporan keuangan otomatis.

---

## 📋 Deskripsi

FinStocks adalah Sistem Informasi Manajemen berbasis web yang dirancang khusus untuk UMKM Mak Tunik (gerai ayam bakar). Sistem ini menggantikan pencatatan manual menjadi digital dengan fitur:

- **Dashboard Analitik** — Ringkasan penjualan, stok kritis, menu terlaris
- **Manajemen Transaksi** — Input POS kasir, riwayat, filter, detail
- **Monitoring Persediaan** — CRUD bahan baku, restock, riwayat stok, level indikator
- **Laporan Keuangan** — Pendapatan, pengeluaran, laba bersih per periode + export PDF/Excel
- **Manajemen Pengguna** — CRUD user dengan role OWNER & KARYAWAN
- **Role-Based Access Control** — Owner akses penuh, Karyawan hanya transaksi

---

## 🛠️ Tech Stack

| Layer | Teknologi |
|---|---|
| Frontend | React 18 (Vite), Tailwind CSS 3, Zustand, Recharts |
| Backend | Node.js, Express 5, Prisma ORM 5 |
| Database | MySQL 8 |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Export | pdfkit (PDF), exceljs (Excel) |

---

## 🚀 Cara Menjalankan (Development)

### Prasyarat

- Node.js ≥ 20.x
- MySQL 8.x (running di localhost:3306)
- npm atau yarn

### 1. Clone Repository

```bash
git clone <repo-url>
cd finstocks
```

### 2. Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Salin file environment
cp .env.example .env
# Edit .env → isi DATABASE_URL, JWT_SECRET

# Buat database MySQL
# mysql -u root -p -e "CREATE DATABASE finstocks_db;"

# Jalankan migrasi Prisma
npx prisma migrate dev --name init

# Isi data awal (seed)
npx prisma db seed

# Jalankan server backend
npm run dev
```

Server backend akan berjalan di `http://localhost:5000`

### 3. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Salin file environment
cp .env.example .env

# Jalankan frontend
npm run dev
```

Frontend akan berjalan di `http://localhost:5173`

### 4. Akun Default (Seed Data)

| Username | Password | Role |
|---|---|---|
| `owner` | `owner123` | OWNER |
| `karyawan1` | `karyawan123` | KARYAWAN |
| `karyawan2` | `karyawan123` | KARYAWAN |

---

## 📁 Struktur Folder

```
finstocks/
├── backend/
│   ├── prisma/              # Schema & seed
│   ├── src/
│   │   ├── config/          # Database connection
│   │   ├── middlewares/      # Auth & Role middleware
│   │   ├── modules/          # 7 modul (auth, transaksi, persediaan, dll)
│   │   ├── utils/            # Response helper, JWT helper
│   │   └── index.js          # Entry point Express
│   ├── Dockerfile
│   └── package.json
└── frontend/
    ├── src/
    │   ├── api/              # Axios instance
    │   ├── components/       # UI (Button, Card, dll) + Layout (Sidebar, Navbar)
    │   ├── pages/            # 9 halaman (Login, Dashboard, Transaksi, dll)
    │   ├── store/            # Zustand auth store
    │   └── utils/            # Format Rupiah, Format Tanggal
    ├── vercel.json
    └── package.json
```

---

## 🔌 API Endpoints

| Method | Endpoint | Deskripsi | Auth |
|---|---|---|---|
| POST | `/api/auth/login` | Login | ❌ |
| GET | `/api/auth/me` | Profil user login | ✅ |
| POST | `/api/auth/logout` | Logout | ✅ |
| GET/POST | `/api/transaksi` | List / Buat transaksi | ✅ |
| GET/PUT/DELETE | `/api/transaksi/:id` | Detail / Update / Hapus | ✅ |
| PUT | `/api/transaksi/:id/status` | Update status | ✅ OWNER |
| GET/POST | `/api/persediaan` | List / Tambah bahan | ✅ OWNER |
| PUT/DELETE | `/api/persediaan/:id` | Edit / Hapus bahan | ✅ OWNER |
| POST | `/api/persediaan/:id/restock` | Input stok masuk | ✅ OWNER |
| GET | `/api/persediaan/riwayat` | Riwayat stok | ✅ OWNER |
| GET/POST | `/api/menu` | List / Tambah menu | ✅ |
| PUT/DELETE | `/api/menu/:id` | Edit / Hapus menu | ✅ OWNER |
| GET | `/api/dashboard/summary` | Ringkasan hari ini | ✅ |
| GET | `/api/dashboard/grafik` | Data grafik 7 hari | ✅ |
| GET | `/api/dashboard/menu-terlaris` | Top 5 menu | ✅ |
| GET | `/api/dashboard/stok-kritis` | Peringatan stok | ✅ |
| GET | `/api/laporan/keuangan` | Data laporan periode | ✅ OWNER |
| GET | `/api/laporan/export/pdf` | Download PDF | ✅ OWNER |
| GET | `/api/laporan/export/excel` | Download Excel | ✅ OWNER |
| GET/POST | `/api/pengguna` | List / Tambah pengguna | ✅ OWNER |
| PUT/DELETE | `/api/pengguna/:id` | Edit / Hapus pengguna | ✅ OWNER |
| PUT | `/api/pengguna/:id/reset-password` | Reset password | ✅ OWNER |

---

## 🚢 Deployment

### Frontend → Vercel

1. Push repo ke GitHub
2. Import project di [vercel.com](https://vercel.com)
3. Set **Root Directory** = `frontend`
4. Set **Build Command** = `npm run build`
5. Set **Output Directory** = `dist`
6. Tambahkan Environment Variable: `VITE_API_BASE_URL` = URL backend production

### Backend → Railway / Render

1. Import repo di [railway.app](https://railway.app) atau [render.com](https://render.com)
2. Set **Root Directory** = `backend`
3. Tambahkan MySQL add-on (Railway) atau gunakan PlanetScale
4. Set Environment Variables:
   - `DATABASE_URL` = MySQL connection string
   - `JWT_SECRET` = Secret key untuk JWT
   - `JWT_EXPIRES_IN` = `8h`
   - `NODE_ENV` = `production`
   - `FRONTEND_URL` = URL frontend Vercel
5. Deploy

---

## 📄 Lisensi

Hak Milik UMKM Mak Tunik © 2026
Dibuat oleh Tim Pengembangan FinStocks — Mata Kuliah MPPL
