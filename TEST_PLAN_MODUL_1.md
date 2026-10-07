# Dokumen Rencana Pengujian (Test Plan)
## FinStocks

---

# Halaman 2: Informasi Dokumen & Riwayat Revisi

### Tabel Metadata Dokumen
| Bidang | Detail |
| :--- | :--- |
| **Identifikasi Test Plan** | `TP-FINSTOCK-MOD1-202310370311426` |
| **Nama Aplikasi** | **FinStocks** |
| **Versi** | **v1.0.0** |
| **Peran yang Dipilih untuk Diuji** | **Owner** |
| **Nama Praktikan** | **Raditya Zeliq Amanta** |
| **NIM** | **202310370311426** |
| **Kelas** | **PKPL D** |
| **Tanggal Dibuat** | **07 Oktober 2026** |
| **Tanggal Terakhir Diperbarui** | **07 Oktober 2026** |
| **Status** | **Draf** |

### Riwayat Revisi
| Versi | Tanggal Revisi | Diperbarui Oleh | Deskripsi Perubahan |
| :---: | :---: | :---: | :--- |
| **1.0** | 07 Oktober 2026 | Raditya Zeliq Amanta | Draf awal dokumen Test Plan FinStocks untuk Modul 1 |

---

# Halaman 3: DAFTAR ISI

* **DAFTAR ISI** ................................................................................................. 3
* **1. Konteks Pengujian** ............................................................................ 4
  * 1.1 Item Uji ............................................................................................ 4
  * 1.2 Cakupan Pengujian ........................................................................... 4
  * 1.3 Peran yang Dipilih untuk Diuji .............................................................. 5
  * 1.4 Asumsi dan Batasan ........................................................................... 5
* **2. Daftar Risiko** .................................................................................... 6
* **3. Strategi Pengujian** ......................................................................... 7
  * 3.1 Pendekatan Keseluruhan .................................................................... 7
  * 3.2 Arah Pengujian yang Direncanakan ..................................................... 7
  * 3.3 Kriteria ............................................................................................ 7
* **4. Lingkungan Pengujian** ..................................................................... 8
  * 4.1 Perangkat dan Perangkat Keras ........................................................... 8
  * 4.2 Perangkat Lunak dan Alat ................................................................... 8
  * 4.3 Jaringan dan Backend ........................................................................ 8
  * 4.4 Data Uji ............................................................................................ 8
* **5. Jadwal Pengujian** ........................................................................... 10
* **6. Luaran Pengujian** ............................................................................ 11
* **Lampiran A: Glosarium** ........................................................................ 12

---

# Halaman 4: 1. Konteks Pengujian

Dokumen kebutuhan awal merupakan salah satu item kesiapan yang akan digunakan pada Modul 2. Pada Modul 1, praktikan cukup mengidentifikasi sumber kebutuhan yang tersedia dan mulai melengkapinya secara bertahap; dokumen tersebut belum harus selesai pada modul ini.

### 1.1 Item Uji
| Bidang | Deskripsi |
| :--- | :--- |
| **Nama Aplikasi** | **FinStocks** |
| **Platform** | **Web** |
| **Versi** | **v1.0.0** |
| **URL Deployment / Akses** | `https://finstock-maktunik.vercel.app/` |
| **Tumpukan Teknologi** | React 19 (Vite), Tailwind CSS, Zustand, Node.js & Express.js 5, Prisma ORM, Supabase PostgreSQL Cloud |
| **Deskripsi Singkat** | FinStocks adalah aplikasi web manajemen operasional terpadu untuk UMKM kuliner Mak Tunik yang mencakup audit riwayat transaksi penjualan, pengelolaan persediaan stok bahan baku real-time, manajemen mitra supplier/vendor, dan pencatatan biaya pengeluaran operasional. |

---

### 1.2 Cakupan Pengujian

#### Fitur dalam Cakupan (In-Scope)
| No. | Nama Fitur | Jenis Fitur | Deskripsi Singkat |
| :---: | :--- | :---: | :--- |
| 1 | **Login** | Fitur Autentikasi | Otentikasi hak akses Owner dengan validasi username & password, show/hide password, penyimpanan token JWT, dan proteksi akun. |
| 2 | **Register** | Fitur Autentikasi | Pendaftaran akun baru dengan validasi keunikan username, batas panjang password, dan pemilihan peran pengguna. |
| 3 | **Forgot Password** | Fitur Autentikasi | Alur pemulihan kata sandi pengguna melalui permintaan OTP/token verifikasi dan penetapan password baru. |
| 4 | **Transaksi** | Fitur Tambahan | Audit riwayat transaksi kasir, filter rentang tanggal, filter metode bayar (Tunai, QRIS, Transfer), serta pemeriksaan rincian invoice penjualan. |
| 5 | **Pengeluaran** | Fitur Tambahan | Pengelolaan pencatatan biaya operasional harian (CRUD), nominal biaya, kategori beban, relasi data vendor, dan unggah berkas bukti kuitansi. |
| 6 | **Menu** | Fitur Tambahan | Pengelolaan katalog menu makanan dan minuman (CRUD), penetapan harga satuan, kategori produk, serta switch status ketersediaan item (Tersedia / Kosong). |
| 7 | **Persediaan** | Fitur Tambahan | Pengelolaan stok bahan baku (CRUD), pengaturan safety stock (stok minimum), riwayat mutasi restock cepat (+10, +50), dan klasifikasi status otomatis (Aman/Kritis/Habis). |
| 8 | **Vendor** | Fitur Tambahan | Pengelolaan data mitra supplier bahan baku (CRUD) mencakup kontak telepon, email, alamat, catatan pasokan, dan riwayat belanja pengeluaran. |

---

# Halaman 5: Out-of-Scope, Peran, Asumsi & Batasan

#### Di Luar Cakupan (Out-of-Scope)
| No. | Fitur / Aspek | Alasan Pengecualian |
| :---: | :--- | :--- |
| 1 | **Ekspor Rekapitulasi Laporan (PDF / Excel)** | Fitur ekspor laporan keuangan berada di luar 8 fitur inti yang dipilih untuk cakupan pengujian awal Modul 1. |
| 2 | **Pengujian Beban & Kinerja (Load / Stress Testing)** | Pengujian pada tahap ini difokuskan pada uji fungsionalitas antarmuka, business rule, dan validasi input (Black-box), bukan pengujian beban kinerja tinggi. |
| 3 | **Integrasi Payment Gateway Otomatis** | Pencatatan metode pembayaran (Tunai, QRIS, Transfer) diverifikasi secara internal di sistem tanpa webhook API gateway bank pihak ketiga. |

---

### 1.3 Peran yang Dipilih untuk Diuji
| Bidang | Detail |
| :--- | :--- |
| **Nama Peran** | **Owner** |
| **Deskripsi Peran** | Pemilik usaha (*Super Administrator*) yang memegang kewenangan penuh atas monitoring keuangan toko, penetapan harga jual menu, pengendalian stok bahan baku, audit biaya pengeluaran operasional, serta hubungan kemitraan dengan vendor supplier. |
| **Fitur yang Dapat Diakses** | Login, Register, Forgot Password, Transaksi, Pengeluaran, Menu, Persediaan, Vendor, Dashboard, dan Laporan. |
| **Alasan Pemilihan** | Peran Owner memiliki wewenang paling luas dan mencakup aturan bisnis (*business rules*) paling kompleks di dalam sistem FinStocks (seperti kalkulasi status kritis bahan baku, validasi relasi vendor ke pengeluaran, serta validasi batas nilai harga dan stok). Hal ini sangat ideal untuk penerapan teknik uji **Equivalence Partitioning (EP)** dan **Boundary Value Analysis (BVA)**. |

---

### 1.4 Asumsi dan Batasan
| Jenis | Deskripsi |
| :--- | :--- |
| **Asumsi** | Seluruh 8 fitur yang dipilih telah selesai diimplementasikan, berfungsi penuh, dan dapat didemonstrasikan di tautan publik: `https://finstock-maktunik.vercel.app/`. |
| **Asumsi** | Akun uji dengan peran Owner (`username: owner`, `password: owner123`) telah terdaftar dan aktif di basis data cloud Supabase. |
| **Batasan** | Pengujian dibatasi secara konsisten hanya pada alur kerja dan otorisasi dari sudut pandang peran Owner. |
| **Batasan** | Pengujian fokus pada antarmuka web (*desktop browser*). |
| **Batasan** | Layanan pengiriman OTP pada Lupa Password disimulasikan menggunakan log server / token development apabila jaringan email SMTP internet tidak tersedia. |

---

# Halaman 6: 2. Daftar Risiko

*(Skala Dampak & Kemungkinan: 1 - 5. Prioritas = Dampak $\times$ Kemungkinan)*

| ID Risiko | Deskripsi Risiko | Jenis | Dampak | Kemungkinan | Prioritas | Strategi Mitigasi |
| :---: | :--- | :---: | :---: | :---: | :---: | :--- |
| **R-01** | Token otentikasi JWT kedaluwarsa atau hilang di localStorage saat sesi pengujian berjalan | Risiko Produk | 4 | 2 | **8** | Implementasikan penanganan error 401 pada Axios interceptor dengan auto-redirect ke halaman Login dan notifikasi toast peringatan yang jelas. |
| **R-02** | Inkonsistensi data persediaan akibat input stok bernilai negatif, karakter non-angka, atau klik tombol restock berulang (*spam click*) | Risiko Produk | 4 | 3 | **12** | Terapkan validasi input ketat (BVA: nilai $\ge 0$), penonaktifan tombol (*disabled state*) selama proses async berjalan, dan verifikasi perubahan status otomatis (Aman/Kritis/Habis). |
| **R-03** | Kegagalan penyimpanan data pengeluaran akibat ukuran berkas bukti kuitansi melebihi batas atau format file tidak sesuai | Risiko Produk | 3 | 3 | **9** | Konfigurasikan middleware upload dengan batas maksimal 5 MB dan whitelist ekstensi file (.jpg, .jpeg, .png, .pdf) baik di frontend maupun backend. |
| **R-04** | Duplikasi username saat registrasi akun baru yang menyebabkan kegagalan sistem tanpa pesan error yang jelas | Risiko Produk | 4 | 3 | **12** | Tangani constraint database `@unique` Prisma dengan kode status HTTP 400 dan pesan kesalahan ramah pengguna pada antarmuka. |
| **R-05** | Kesalahan relasi data saat menghapus data vendor yang sudah tertaut pada riwayat transaksi pengeluaran | Risiko Produk | 4 | 2 | **8** | Gunakan skema relasi `onDelete: SetNull` pada tabel Pengeluaran serta tampilkan dialog konfirmasi sebelum aksi hapus dieksekusi. |
| **R-06** | Kendala latensi atau koneksi pooler database terputus saat proses eksekusi pengujian | Risiko Proyek | 3 | 2 | **6** | Gunakan connection pooling Supabase dengan port transaction pooler yang stabil dan sediakan skrip seed untuk memulihkan data uji awal. |

---

# Halaman 7: 3. Strategi Pengujian

### 3.1 Pendekatan Keseluruhan
| Bidang | Deskripsi |
| :--- | :--- |
| **Pendekatan Pengujian** | `<Belum ditetapkan; dilengkapi pada modul berikutnya>` |
| **Tingkat Pengujian** | `<Belum ditetapkan; dilengkapi pada modul berikutnya>` |
| **Jenis Pengujian Utama** | `<Belum ditetapkan; dilengkapi pada modul berikutnya>` |
| **Fitur Berprioritas Tinggi** | **Persediaan (R-02)** dan **Register/Autentikasi (R-04)** *(Berdasarkan skor risiko prioritas 12)* |

### 3.2 Arah Pengujian yang Direncanakan
| Aspek | Status | Catatan |
| :--- | :---: | :--- |
| **Arah dan Teknik Pengujian** | `<Belum ditetapkan>` | Dilengkapi setelah materi terkait dipelajari pada modul berikutnya. *(Pertahankan placeholder ini sesuai arahan panduan)* |

### 3.3 Kriteria
| Jenis Kriteria | Deskripsi |
| :--- | :--- |
| **Kriteria Masuk** | Aplikasi web FinStocks dapat diakses melalui browser pada `https://finstock-maktunik.vercel.app/`, database cloud terhubung normal, dan akun uji peran Owner siap digunakan. |
| **Kriteria Keluar** | Seluruh test case yang dirancang untuk 8 fitur yang dipilih telah dieksekusi 100%, serta tidak ada defect berstatus Blocker atau Critical yang belum terselesaikan. |
| **Kriteria Lolos** | Respon antarmuka (notifikasi toast, status badge, tabel data) dan kode status HTTP (200/201) sesuai sepenuhnya dengan hasil yang diharapkan (*Expected Result*). |
| **Kriteria Gagal** | Terjadi kesalahan sistem yang tidak tertangani (*Unhandled Exception/500*), tampilan aplikasi crash/freeze, data gagal tersimpan, atau validasi input gagal menyaring input tidak valid. |
| **Pengujian Ulang** | Test case yang berstatus gagal (*Failed*) akan dieksekusi kembali setelah perbaikan bug selesai diterapkan hingga memperoleh status lolos (*Passed*). |
| **Pengujian Regresi** | Melakukan eksekusi ulang pada alur kerja utama (terutama alur Login dan CRUD Persediaan/Menu) setelah perbaikan kode dilakukan untuk memastikan tidak muncul error baru pada fitur lain. |

---

# Halaman 8 & 9: 4. Lingkungan Pengujian

### 4.1 Perangkat dan Perangkat Keras
| Item | Detail |
| :--- | :--- |
| **Jenis Perangkat** | **Laptop** |
| **Processor** | **Intel Core i7** |
| **RAM** | **16 GB** |
| **Sistem Operasi** | **Windows 11 64-bit** |

### 4.2 Perangkat Lunak dan Alat
| Alat / Perangkat Lunak | Versi / Detail | Tujuan |
| :--- | :--- | :--- |
| **Browser / Perangkat** | Google Chrome (versi 125+) / Microsoft Edge | Eksekusi pengujian antarmuka aplikasi web |
| **Alat Dokumentasi** | Microsoft Word / Google Docs | Pembuatan dokumen Test Plan dan pencatatan hasil pengujian |
| **Alat Tangkapan Layar** | Snipping Tool / Lightshot | Pengumpulan bukti visual tangkapan layar (*evidence*) hasil uji |

### 4.3 Jaringan dan Backend
| Item | Detail |
| :--- | :--- |
| **Jaringan** | Koneksi Jaringan Wi-Fi Pribadi / Hotspot |
| **Backend / API** | REST API Node.js & Express.js 5 (Vercel Serverless Function), Prisma ORM, Supabase PostgreSQL Cloud |
| **URL Dasar Pengujian** | `https://finstock-maktunik.vercel.app/` |

### 4.4 Data Uji
| Jenis Data | Deskripsi |
| :--- | :--- |
| **Akun Uji Valid** | Username: `owner`, Password: `owner123` (Peran: OWNER) |
| **Akun Uji Tidak Valid** | Username tidak terdaftar (`user_unknown`), Password salah (`pass_salah`), Password kurang dari 6 karakter (`12345`), konfirmasi password tidak cocok |
| **Contoh Data Input** | • **Menu:** Nama: "Ayam Bakar Madu", Kategori: "MAKANAN", Harga: 25000, Status: Tersedia.<br>• **Persediaan:** Nama: "Beras Premium", Kategori: "BAHAN_POKOK", Stok: 50, Stok Min: 10, Satuan: "kg", Harga: 14000.<br>• **Pengeluaran:** Keterangan: "Beli Minyak Goreng", Kategori: "Operasional", Jumlah: 150000, File: nota.png.<br>• **Vendor:** Nama: "CV Berkah Pangan", Telepon: "081234567890", Alamat: "Jl. Mawar No. 10". |
| **Data Uji Tambahan** | `<Belum ditetapkan; dilengkapi pada modul berikutnya>` |

---

# Halaman 10: 5. Jadwal Pengujian

| Modul | Aktivitas Pengujian Utama | Perkiraan Waktu | Luaran Utama |
| :---: | :--- | :---: | :--- |
| **Modul 1** | Perencanaan pengujian, analisis risiko, dan registrasi proyek | Minggu 1 - Oktober 2026 | Dokumen Test Plan dan entri registrasi proyek |
| **Modul 2** | `<Belum ditetapkan>` | `<Belum ditetapkan>` | `<Belum ditetapkan>` |
| **Modul 3** | `<Belum ditetapkan>` | `<Belum ditetapkan>` | `<Belum ditetapkan>` |
| **Modul 4** | `<Belum ditetapkan>` | `<Belum ditetapkan>` | `<Belum ditetapkan>` |
| **Modul 5** | `<Belum ditetapkan>` | `<Belum ditetapkan>` | `<Belum ditetapkan>` |
| **Modul 6** | `<Belum ditetapkan>` | `<Belum ditetapkan>` | `<Belum ditetapkan>` |
| **UAP** | `<Belum ditetapkan>` | `<Belum ditetapkan>` | `<Belum ditetapkan>` |

---

# Halaman 11: 6. Luaran Pengujian

| Modul | Luaran | Format | Status |
| :---: | :--- | :---: | :---: |
| **Modul 1** | Dokumen Test Plan | DOCX / PDF | **Sedang Berjalan** |
| **Modul 1** | Entri Lembar Registrasi Proyek | Google Sheets | **Sedang Berjalan** |
| **Modul 2** | `<Belum ditetapkan>` | `<Belum ditetapkan>` | `<Belum ditetapkan>` |
| **Modul 3** | `<Belum ditetapkan>` | `<Belum ditetapkan>` | `<Belum ditetapkan>` |
| **Modul 4** | `<Belum ditetapkan>` | `<Belum ditetapkan>` | `<Belum ditetapkan>` |
| **Modul 5** | `<Belum ditetapkan>` | `<Belum ditetapkan>` | `<Belum ditetapkan>` |
| **Modul 6** | `<Belum ditetapkan>` | `<Belum ditetapkan>` | `<Belum ditetapkan>` |
| **UAP** | `<Belum ditetapkan>` | `<Belum ditetapkan>` | `<Belum ditetapkan>` |

---

# Halaman 12: Lampiran A: Glosarium

Istilah kunci yang digunakan dalam dokumen ini, berdasarkan **ISO/IEC/IEEE 29119-1**:

| Istilah | Definisi |
| :--- | :--- |
| **Item Uji** | Objek yang diuji. Dalam praktikum ini, objek tersebut adalah aplikasi web FinStocks. |
| **Dasar Pengujian** | Sumber diturunkannya sebuah test condition, dapat berupa kebutuhan, user story, atau perilaku yang sudah disepakati. |
| **Kondisi Pengujian** | Aspek dari aplikasi yang dapat diuji secara spesifik, dan menjadi dasar penulisan test case. |
| **Kasus Uji** | Input konkret, langkah-langkah, dan hasil yang diharapkan, yang digunakan untuk memeriksa satu test condition. |
| **Lingkungan Pengujian** | Perangkat, software, dan akses yang dibutuhkan untuk benar-benar menjalankan pengujian. |
| **Risk** | Kemungkinan terjadinya suatu masalah, baik pada produk itu sendiri (Risiko Produk) maupun pada proyek di sekitarnya (Risiko Proyek). |
| **Incident** | Segala sesuatu yang tidak terduga yang ditemukan selama pengujian dan perlu ditelusuri lebih lanjut. |
| **Traceability** | Kemampuan untuk menelusuri hubungan dari sebuah kebutuhan, ke sebuah fitur, hingga ke test case yang memeriksanya. |
| **Dampak** | Seberapa serius akibat yang akan timbul apabila sebuah risiko benar-benar terjadi, dinilai dengan skala 1 sampai 5. |
| **Kemungkinan** | Seberapa besar kemungkinan sebuah risiko benar-benar terjadi, dinilai dengan skala 1 sampai 5. |
| **Prioritas** | Tingkat kepentingan suatu risiko secara keseluruhan, dihitung sebagai Dampak dikalikan Kemungkinan ($D \times K$). |
| **Strategi Mitigasi** | Tindakan yang direncanakan untuk mengurangi dampak suatu risiko atau kemungkinan risiko tersebut terjadi. |
| **Kriteria Masuk** | Kondisi yang harus terpenuhi sebelum pengujian dapat dimulai. |
| **Kriteria Keluar** | Kondisi yang menandakan bahwa pengujian telah selesai. |
