import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Plus, Edit2, Trash2, Wallet, FileText, Image as ImageIcon, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axiosInstance from '../api/axiosInstance';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import ConfirmModal from '../components/ui/ConfirmModal';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { formatRupiah } from '../utils/formatRupiah';
import { exportToExcel, exportToPDF } from '../utils/exportUtils';
import { formatTanggalWaktu } from '../utils/formatTanggal';
import Pagination from '../components/ui/Pagination';
import useSortableData from '../hooks/useSortableData';

const KATEGORI_PILIHAN = [
  { value: 'BAHAN_BAKU', label: 'Bahan Baku' },
  { value: 'OPERASIONAL', label: 'Operasional' },
  { value: 'GAJI', label: 'Gaji Karyawan' },
  { value: 'UTILITAS', label: 'Utilitas (Listrik/Air)' },
  { value: 'LAINNYA', label: 'Lainnya' },
];

const Pengeluaran = () => {
  const [pengeluaran, setPengeluaran] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const fileInputRef = useRef(null);
  
  // Modal & Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('TAMBAH'); // TAMBAH, EDIT
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({
    keterangan: '',
    jumlah: '',
    kategori: 'LAINNYA',
    tanggal: new Date().toISOString().slice(0, 16),
    vendorId: '',
    file: null,
  });

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterKategori, setFilterKategori] = useState('SEMUA');
  const [filterTanggal, setFilterTanggal] = useState('');

  // Confirm Modal state
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [listRes, sumRes, vendorRes] = await Promise.all([
        axiosInstance.get('/pengeluaran'),
        axiosInstance.get('/pengeluaran/summary'),
        axiosInstance.get('/vendor'),
      ]);
      setPengeluaran(listRes.data.data);
      setSummary(sumRes.data.data);
      setVendors(vendorRes.data.data);
    } catch (error) {
      toast.error('Gagal memuat data pengeluaran');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredData = useMemo(() => {
    return pengeluaran.filter(item => {
      const matchesSearch = item.keterangan?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesKategori = filterKategori === 'SEMUA' || item.kategori === filterKategori;
      const matchesTanggal = filterTanggal ? item.tanggal.startsWith(filterTanggal) : true;
      return matchesSearch && matchesKategori && matchesTanggal;
    });
  }, [pengeluaran, searchTerm, filterKategori, filterTanggal]);

  const { items: sortedData, requestSort, sortConfig } = useSortableData(filteredData);

  // Reset currentPage to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterKategori, filterTanggal, sortConfig?.key, sortConfig?.direction]);

  const getSortIcon = (columnKey) => {
    if (!sortConfig || sortConfig.key !== columnKey) {
      return <ArrowUpDown size={12} className="text-neutral-300" />;
    }
    return sortConfig.direction === 'ascending' 
      ? <ArrowUp size={12} className="text-[#002444]" />
      : <ArrowDown size={12} className="text-[#002444]" />;
  };

  const openModal = (type, item = null) => {
    setModalType(type);
    setSelectedItem(item);
    
    if (type === 'EDIT' && item) {
      setFormData({
        keterangan: item.keterangan,
        jumlah: item.jumlah,
        kategori: item.kategori,
        // Konversi ISO string ke YYYY-MM-DDThh:mm format untuk input datetime-local
        tanggal: new Date(new Date(item.tanggal).getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 16),
        vendorId: item.vendorId || '',
        file: null,
      });
    } else {
      setFormData({
        keterangan: '',
        jumlah: '',
        kategori: 'LAINNYA',
        tanggal: new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 16),
        vendorId: '',
        file: null,
      });
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.keterangan || !formData.jumlah) {
      toast.error('Keterangan dan jumlah wajib diisi');
      return;
    }

    try {
      const payload = new FormData();
      payload.append('keterangan', formData.keterangan);
      payload.append('jumlah', formData.jumlah);
      payload.append('kategori', formData.kategori);
      payload.append('tanggal', formData.tanggal);
      if (formData.vendorId) {
        payload.append('vendorId', formData.vendorId);
      } else {
        payload.append('vendorId', 'null'); // Indicate null intentionally if possible
      }
      if (formData.file) {
        payload.append('bukti', formData.file);
      }

      const config = { headers: { 'Content-Type': 'multipart/form-data' } };

      if (modalType === 'TAMBAH') {
        await axiosInstance.post('/pengeluaran', payload, config);
        toast.success('Pengeluaran berhasil dicatat');
      } else {
        await axiosInstance.put(`/pengeluaran/${selectedItem.id}`, payload, config);
        toast.success('Pengeluaran berhasil diperbarui');
      }
      setIsModalOpen(false);
      fetchData(); // Refresh data
    } catch (error) {
      toast.error(`Gagal ${modalType === 'TAMBAH' ? 'menambah' : 'memperbarui'} pengeluaran`);
      console.error(error);
    }
  };

  const handleDeleteClick = (id) => {
    setConfirmDeleteId(id);
  };

  const executeDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      await axiosInstance.delete(`/pengeluaran/${confirmDeleteId}`);
      toast.success('Data pengeluaran berhasil dihapus');
      fetchData(); // Refresh data
    } catch (error) {
      toast.error('Gagal menghapus pengeluaran');
      console.error(error);
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const getKategoriBadge = (kategori) => {
    switch (kategori) {
      case 'BAHAN_BAKU': return <Badge variant="warning" className="bg-[#ffecc7] text-[#653e00] border-none">Bahan Baku</Badge>;
      case 'OPERASIONAL': return <Badge variant="info" className="bg-blue-50 text-blue-700 border-none">Operasional</Badge>;
      case 'GAJI': return <Badge variant="primary" className="bg-purple-50 text-purple-700 border-none">Gaji Karyawan</Badge>;
      case 'UTILITAS': return <Badge variant="secondary" className="bg-neutral-100 text-neutral-700 border-none">Utilitas</Badge>;
      default: return <Badge variant="neutral" className="bg-neutral-100 text-neutral-600 border-none">Lainnya</Badge>;
    }
  };

  const StatCard = ({ title, value, subtitle, subtitleColorClass, topBorderColor }) => (
    <Card topBorderColor={topBorderColor} className="flex flex-col justify-center py-5 px-6">
      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2">{title}</p>
      <h4 className="text-2xl font-bold text-neutral-800 leading-none mb-2">{value}</h4>
      <p className={`text-[11px] font-medium ${subtitleColorClass}`}>{subtitle}</p>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Expense title and trigger */}
      <div className="flex justify-between items-center bg-white p-5 rounded-xl border border-[#c3c6cf]/30 shadow-sm">
        <div>
          <h3 className="text-sm font-bold text-[#002444] uppercase tracking-wider mb-1">
            Catatan Pengeluaran Operasional
          </h3>
          <p className="text-xs text-[#73777f]">Pantau pengeluaran bulanan dan catat pembayaran operasional bisnis Anda.</p>
        </div>

        <button
          onClick={() => openModal('TAMBAH')}
          className="px-4 py-2 bg-[#006c4e] text-white rounded-lg font-bold text-xs hover:bg-[#00513a] flex items-center gap-1 transition-colors"
        >
          <Plus size={16} />
          <span>Tambah Pengeluaran</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard 
          title="PENGELUARAN BULAN INI" 
          value={formatRupiah(summary?.totalBulanIni || 0)} 
          subtitle="Bulan berjalan"
          subtitleColorClass="text-neutral-500"
          topBorderColor="indigo"
        />
        <StatCard 
          title="PENGELUARAN BULAN LALU" 
          value={formatRupiah(summary?.totalBulanLalu || 0)} 
          subtitle="Bulan sebelumnya"
          subtitleColorClass="text-neutral-500"
          topBorderColor="neutral"
        />
        <StatCard 
          title="KATEGORI TERBESAR (BULAN INI)" 
          value={summary?.kategoriTerbesar?.kategori ? summary.kategoriTerbesar.kategori.replace('_', ' ') : '-'} 
          subtitle={formatRupiah(summary?.kategoriTerbesar?.jumlah || 0)}
          subtitleColorClass="text-orange-500"
          topBorderColor="warning"
        />
      </div>

      <Card 
        title="Riwayat Pengeluaran" 
        action={
          <div className="flex gap-2">
            <button onClick={async () => {
              if (filteredData.length === 0) { toast.error('Tidak ada data'); return; }
              const cols = [
                { header: 'ID', key: 'id', format: (v) => `#E-${v}` },
                { header: 'Tanggal', key: 'tanggal', format: (v) => formatTanggalWaktu(v) },
                { header: 'Keterangan', key: 'keterangan' },
                { header: 'Kategori', key: 'kategori' },
                { header: 'Jumlah (Rp)', key: 'jumlah', format: (v) => Number(v || 0) },
              ];
              try {
                await exportToExcel(filteredData, cols, `pengeluaran_${new Date().toISOString().split('T')[0]}`, 'Pengeluaran');
                toast.success('File Excel berhasil di-download');
              } catch (e) { toast.error('Gagal mengekspor Excel'); }
            }} className="px-3 py-1.5 border border-green-500 text-green-600 rounded-md text-[11px] font-medium bg-green-50 hover:bg-green-100">Ekspor Excel</button>
            <button onClick={() => {
              if (filteredData.length === 0) { toast.error('Tidak ada data'); return; }
              const cols = [
                { header: 'Tanggal', key: 'tanggal', format: (v) => formatTanggalWaktu(v) },
                { header: 'Keterangan', key: 'keterangan' },
                { header: 'Kategori', key: 'kategori', format: (v) => v.replace('_', ' ') },
                { header: 'Jumlah', key: 'jumlah', format: (v) => formatRupiah(v) },
              ];
              exportToPDF(filteredData, cols, `pengeluaran_${new Date().toISOString().split('T')[0]}`, {
                title: 'Laporan Pengeluaran Operasional',
                subtitle: `Total ${filteredData.length} catatan — Nilai: ${formatRupiah(filteredData.reduce((a, b) => a + Number(b.jumlah || 0), 0))}`,
              });
              toast.success('File PDF berhasil di-download');
            }} className="px-3 py-1.5 border border-red-500 text-red-600 rounded-md text-[11px] font-medium bg-red-50 hover:bg-red-100">Ekspor PDF</button>
          </div>
        }
        noPadding
      >
        <div className="p-4 border-b border-[#c3c6cf]/30 flex flex-wrap gap-3 bg-white">
          <input 
            type="text" 
            placeholder="Cari keterangan..." 
            className="flex-1 min-w-[200px] px-3 py-1.5 border border-[#c3c6cf] rounded-md text-sm outline-none focus:border-[#002444] text-[#191c1e] transition-colors" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select 
            className="px-3 py-1.5 border border-[#c3c6cf] rounded-md text-sm bg-white outline-none focus:border-[#002444] text-[#191c1e] transition-colors cursor-pointer"
            value={filterKategori}
            onChange={(e) => setFilterKategori(e.target.value)}
          >
            <option value="SEMUA">Semua Kategori</option>
            {KATEGORI_PILIHAN.map(kat => (
              <option key={kat.value} value={kat.value}>{kat.label}</option>
            ))}
          </select>
          <input 
            type="date" 
            className="px-3 py-1.5 border border-[#c3c6cf] rounded-md text-sm outline-none focus:border-[#002444] text-[#191c1e] transition-colors cursor-pointer"
            value={filterTanggal}
            onChange={(e) => setFilterTanggal(e.target.value)}
          />
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse bg-white">
            <thead>
              <tr className="bg-[#f8f9fb] border-b border-[#c3c6cf]/30 text-[#43474e]">
                <th 
                  className="py-3 px-6 font-semibold cursor-pointer hover:bg-neutral-100 transition-colors select-none"
                  onClick={() => requestSort('tanggal')}
                >
                  <div className="flex items-center gap-2">
                    TANGGAL
                    {getSortIcon('tanggal')}
                  </div>
                </th>
                <th 
                  className="py-3 px-6 font-semibold cursor-pointer hover:bg-neutral-100 transition-colors select-none"
                  onClick={() => requestSort('keterangan')}
                >
                  <div className="flex items-center gap-2">
                    KETERANGAN
                    {getSortIcon('keterangan')}
                  </div>
                </th>
                <th 
                  className="py-3 px-6 font-semibold cursor-pointer hover:bg-neutral-100 transition-colors select-none"
                  onClick={() => requestSort('kategori')}
                >
                  <div className="flex items-center gap-2">
                    KATEGORI
                    {getSortIcon('kategori')}
                  </div>
                </th>
                <th className="py-3 px-6 font-semibold">VENDOR</th>
                <th 
                  className="py-3 px-6 font-semibold cursor-pointer hover:bg-neutral-100 transition-colors select-none"
                  onClick={() => requestSort('jumlah')}
                >
                  <div className="flex items-center gap-2">
                    JUMLAH
                    {getSortIcon('jumlah')}
                  </div>
                </th>
                <th className="py-3 px-6 font-semibold text-center">BUKTI</th>
                <th className="py-3 px-6 font-semibold text-right">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c3c6cf]/20 font-medium text-neutral-600">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#002444] mx-auto"></div>
                  </td>
                </tr>
              ) : sortedData.length > 0 ? (
                sortedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((item) => (
                  <tr key={item.id} className="hover:bg-[#f8f9fb] transition-colors">
                    <td className="py-4 px-6 text-xs text-neutral-500">
                      <div className="flex items-center gap-2">
                        <Wallet size={14} className="text-neutral-400" />
                        {formatTanggalWaktu(item.tanggal)}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-xs font-bold text-[#002444]">{item.keterangan}</td>
                    <td className="py-4 px-6 text-xs">{getKategoriBadge(item.kategori)}</td>
                    <td className="py-4 px-6 text-xs text-neutral-500">{item.vendor ? item.vendor.nama : '-'}</td>
                    <td className="py-4 px-6 text-xs font-mono font-bold text-[#ba1a1a]">{formatRupiah(item.jumlah)}</td>
                    <td className="py-4 px-6 text-center">
                      {item.buktiUrl ? (
                        <a 
                          href={import.meta.env.VITE_API_BASE_URL ? import.meta.env.VITE_API_BASE_URL.replace('/api', item.buktiUrl) : `http://localhost:5000${item.buktiUrl}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] font-medium text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded"
                        >
                          <ImageIcon size={12} /> Lihat
                        </a>
                      ) : (
                        <span className="text-[10px] text-neutral-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => openModal('EDIT', item)} 
                          className="text-[10px] font-medium text-amber-600 hover:text-white hover:bg-amber-500 border border-amber-500 px-3 py-1.5 rounded transition-colors"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(item.id)} 
                          className="text-[10px] font-medium text-red-600 hover:text-white hover:bg-red-500 border border-red-500 px-3 py-1.5 rounded transition-colors"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-xs text-neutral-500 flex flex-col items-center justify-center">
                    <Wallet size={40} className="text-neutral-200 mb-2" />
                    Tidak ada catatan pengeluaran.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination 
          totalItems={sortedData.length} 
          itemsPerPage={itemsPerPage} 
          currentPage={currentPage} 
          onPageChange={setCurrentPage} 
        />
      </Card>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={modalType === 'TAMBAH' ? 'Catat Pengeluaran Baru' : 'Edit Data Pengeluaran'}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            label="Keterangan Pengeluaran" 
            placeholder="Contoh: Pembelian ayam potong 10kg, Bayar listrik bulanan"
            value={formData.keterangan}
            onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
            required
          />
          
          <Input 
            label="Jumlah (Rp)" 
            type="number"
            placeholder="0"
            min="0"
            value={formData.jumlah}
            onChange={(e) => setFormData({ ...formData, jumlah: e.target.value })}
            required
          />

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Kategori</label>
            <select 
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              value={formData.kategori}
              onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
            >
              {KATEGORI_PILIHAN.map(kat => (
                <option key={kat.value} value={kat.value}>{kat.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Pilih Vendor (Opsional)</label>
            <select 
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              value={formData.vendorId}
              onChange={(e) => setFormData({ ...formData, vendorId: e.target.value })}
            >
              <option value="">Lainnya / Tanpa Vendor</option>
              {vendors.map(v => (
                <option key={v.id} value={v.id}>{v.nama}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Tanggal & Waktu</label>
            <input 
              type="datetime-local"
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              value={formData.tanggal}
              onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Upload Bukti Transaksi/Nota (Opsional)</label>
            <input 
              type="file"
              ref={fileInputRef}
              accept=".jpg,.jpeg,.png,.pdf"
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
              onChange={(e) => setFormData({ ...formData, file: e.target.files[0] })}
            />
            {modalType === 'EDIT' && selectedItem?.buktiUrl && !formData.file && (
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <FileText size={12} /> File bukti sudah tersedia. Kosongkan jika tidak ingin diubah.
              </p>
            )}
            <p className="text-xs text-neutral-500 mt-1">Format: JPG, PNG, PDF (Maks. 5MB)</p>
          </div>

          <div className="flex gap-3 justify-end pt-4 mt-6 border-t border-neutral-100">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit">
              {modalType === 'TAMBAH' ? 'Simpan Pengeluaran' : 'Simpan Perubahan'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal 
        isOpen={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        title="Hapus Pengeluaran"
        message="Apakah Anda yakin ingin menghapus data pengeluaran ini? Data yang terhapus tidak dapat dikembalikan."
        onConfirm={executeDelete}
      />
    </div>
  );
};

export default Pengeluaran;
