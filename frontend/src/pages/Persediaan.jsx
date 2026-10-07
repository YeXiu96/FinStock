import React, { useState, useEffect, useMemo } from 'react';
import { Plus, PackagePlus, Edit2, Trash2, ArrowUpCircle, Clock, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axiosInstance from '../api/axiosInstance';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import ConfirmModal from '../components/ui/ConfirmModal';
import Pagination from '../components/ui/Pagination';
import { formatRupiah } from '../utils/formatRupiah';
import { exportToExcel, exportToPDF } from '../utils/exportUtils';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import useSortableData from '../hooks/useSortableData';

const Persediaan = () => {
  const [bahanBaku, setBahanBaku] = useState([]);
  const [riwayatAktivitas, setRiwayatAktivitas] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // State untuk Modals
  const [activeModal, setActiveModal] = useState(null); // 'UPDATE', 'EDIT', 'TAMBAH'
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [restockingId, setRestockingId] = useState(null);

  // State untuk Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterKategori, setFilterKategori] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const dynamicPieData = useMemo(() => {
    let aman = 0;
    let habis = 0;
    let menipis = 0;

    bahanBaku.forEach(item => {
      const stok = parseFloat(item.stok);
      const min = parseFloat(item.stokMinimum);
      
      if (stok <= 0) {
        habis++;
      } else if (stok <= min) {
        menipis++;
      } else {
        aman++;
      }
    });

    const data = [
      { name: 'Aman', value: aman, color: '#10b981' },
      { name: 'Habis', value: habis, color: '#f43f5e' },
      { name: 'Menipis', value: menipis, color: '#f59e0b' }
    ].filter(item => item.value > 0);

    // Fallback untuk grafik jika data kosong
    if (data.length === 0) {
      return [{ name: 'Belum Ada Data', value: 1, color: '#e5e7eb' }];
    }

    return data;
  }, [bahanBaku]);

  const totalNilaiPersediaan = useMemo(() => {
    return bahanBaku.reduce((acc, item) => acc + (parseFloat(item.stok || 0) * parseFloat(item.hargaSatuan || 0)), 0);
  }, [bahanBaku]);

  // State untuk Riwayat
  const [riwayat, setRiwayat] = useState([]);

  useEffect(() => {
    fetchBahanBaku();
    fetchRiwayat();
  }, []);

  const fetchRiwayat = async () => {
    try {
      const response = await axiosInstance.get('/persediaan/riwayat?limit=50');
      setRiwayat(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch riwayat', error);
    }
  };

  const fetchBahanBaku = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get('/persediaan');
      setBahanBaku(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch persediaan', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (type, item = null) => {
    setActiveModal(type);
    setSelectedItem(item);
    if (type === 'UPDATE') {
      setFormData({ jumlah: '' });
    } else if (type === 'EDIT' && item) {
      setFormData({
        namaBahan: item.namaBahan,
        kategori: item.kategori || 'BAHAN_POKOK',
        stok: item.stok,
        satuan: item.satuan,
        stokMinimum: item.stokMinimum || 0,
        hargaSatuan: item.hargaSatuan || 0
      });
    } else if (type === 'TAMBAH') {
      setFormData({
        namaBahan: '',
        kategori: 'BAHAN_POKOK',
        stok: '',
        satuan: '',
        stokMinimum: '',
        hargaSatuan: ''
      });
    }
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedItem(null);
    setFormData({});
  };

  const handleSubmitHapus = async () => {
    if (isSubmitting || !selectedItem) return;
    setIsSubmitting(true);
    try {
      await axiosInstance.delete(`/persediaan/${selectedItem.id}`);
      toast.success(`Bahan baku ${selectedItem.namaBahan} berhasil dihapus`);
      fetchBahanBaku();
      fetchRiwayat();
      closeModal();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menghapus bahan baku');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitUpdate = async () => {
    if (isSubmitting) return;
    if (!formData.jumlah || Number(formData.jumlah) <= 0) {
      return toast.error("Jumlah tambahan harus lebih dari 0");
    }
    setIsSubmitting(true);
    try {
      await axiosInstance.post(`/persediaan/${selectedItem.id}/restock`, { jumlah: Number(formData.jumlah) });
      toast.success(`Stok ${selectedItem.namaBahan} berhasil ditambahkan`);
      fetchBahanBaku();
      fetchRiwayat();
      closeModal();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal mengupdate stok.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickRestock = async (item, amount) => {
    const opKey = `${item.id}-${amount}`;
    if (restockingId) return;
    setRestockingId(opKey);
    try {
      await axiosInstance.post(`/persediaan/${item.id}/restock`, { jumlah: Number(amount) });
      toast.success(`Stok ${item.namaBahan} berhasil ditambahkan +${amount}`, {
        id: `quick-restock-${item.id}`,
      });
      fetchBahanBaku();
      fetchRiwayat();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal mengupdate stok.', {
        id: `quick-restock-${item.id}`,
      });
    } finally {
      setRestockingId(null);
    }
  };

  const handleSubmitEdit = async () => {
    if (isSubmitting) return;
    if (!formData.namaBahan?.trim()) {
      return toast.error('Nama bahan wajib diisi');
    }
    if (!formData.satuan?.trim()) {
      return toast.error('Satuan wajib diisi');
    }
    if (Number(formData.stokMinimum) < 0) {
      return toast.error('Batas minimum stok tidak boleh negatif');
    }
    if (Number(formData.hargaSatuan) < 0) {
      return toast.error('Harga satuan tidak boleh negatif');
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        namaBahan: formData.namaBahan.trim(),
        satuan: formData.satuan.trim(),
        stok: Number(formData.stok),
        stokMinimum: Number(formData.stokMinimum),
        hargaSatuan: Number(formData.hargaSatuan),
      };
      await axiosInstance.put(`/persediaan/${selectedItem.id}`, payload);
      toast.success(`Data ${selectedItem.namaBahan} berhasil diubah`);
      fetchBahanBaku();
      fetchRiwayat();
      closeModal();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menyimpan perubahan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitTambah = async () => {
    if (isSubmitting) return;
    if (!formData.namaBahan?.trim()) {
      return toast.error('Nama bahan wajib diisi');
    }
    if (!formData.satuan?.trim()) {
      return toast.error('Satuan wajib diisi');
    }
    if (formData.stok === '' || Number(formData.stok) < 0) {
      return toast.error('Stok awal tidak boleh bernilai negatif');
    }
    if (Number(formData.stokMinimum) < 0) {
      return toast.error('Batas minimum stok tidak boleh negatif');
    }
    if (Number(formData.hargaSatuan) < 0) {
      return toast.error('Harga satuan tidak boleh negatif');
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        namaBahan: formData.namaBahan.trim(),
        satuan: formData.satuan.trim(),
        stok: Number(formData.stok),
        stokMinimum: Number(formData.stokMinimum),
        hargaSatuan: Number(formData.hargaSatuan),
      };
      await axiosInstance.post(`/persediaan`, payload);
      toast.success(`Bahan baku baru berhasil ditambahkan`);
      fetchBahanBaku();
      fetchRiwayat();
      closeModal();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menambah bahan baku');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (stok, minimalStok) => {
    const isOut = stok <= 0;
    const isCritical = stok > 0 && stok <= minimalStok;
    return (
      <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-[10px] font-bold w-24 ${
        isOut 
          ? 'bg-[#ffdad6] text-[#ba1a1a]' 
          : isCritical 
          ? 'bg-[#ffecc7] text-[#653e00]' 
          : 'bg-[#83f5c6] text-[#006c4e]'
      }`}>
        {isOut ? 'Habis' : isCritical ? 'Kritis' : 'Cukup'}
      </span>
    );
  };

  const getLogIcon = (aksiText) => {
    const text = aksiText.toLowerCase();
    if (text.includes('restock')) {
      return { icon: <ArrowUpCircle size={16} />, bg: 'bg-green-50', text: 'text-green-600' };
    }
    if (text.includes('menambah')) {
      return { icon: <PackagePlus size={16} />, bg: 'bg-blue-50', text: 'text-blue-600' };
    }
    if (text.includes('mengedit')) {
      return { icon: <Edit2 size={16} />, bg: 'bg-orange-50', text: 'text-orange-500' };
    }
    if (text.includes('menghapus')) {
      return { icon: <Trash2 size={16} />, bg: 'bg-red-50', text: 'text-red-500' };
    }
    return { icon: <Clock size={16} />, bg: 'bg-neutral-50', text: 'text-neutral-500' };
  };

  const filteredBahanBaku = bahanBaku.filter(item => {
    const matchesSearch = item.namaBahan.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesKategori = filterKategori ? item.kategori === filterKategori : true;
    
    let matchesStatus = true;
    if (filterStatus) {
      if (filterStatus === 'Habis') {
        matchesStatus = item.stok <= 0;
      } else if (filterStatus === 'Kritis') {
        matchesStatus = item.stok > 0 && item.stok <= (item.stokMinimum || 0);
      } else if (filterStatus === 'Aman') {
        matchesStatus = item.stok > (item.stokMinimum || 0);
      }
    }

    return matchesSearch && matchesKategori && matchesStatus;
  });

  const { items: sortedBahanBaku, requestSort, sortConfig } = useSortableData(filteredBahanBaku);

  // Reset currentPage to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterKategori, filterStatus, sortConfig?.key, sortConfig?.direction]);

  const getSortIcon = (columnKey) => {
    if (!sortConfig || sortConfig.key !== columnKey) {
      return <ArrowUpDown size={12} className="text-neutral-300" />;
    }
    return sortConfig.direction === 'ascending' 
      ? <ArrowUp size={12} className="text-teal-600" />
      : <ArrowDown size={12} className="text-teal-600" />;
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
      {/* Supplies title and trigger */}
      <div className="flex justify-between items-center bg-white p-5 rounded-xl border border-[#c3c6cf]/30 shadow-sm">
        <div>
          <h3 className="text-sm font-bold text-[#002444] uppercase tracking-wider mb-1">
            Pengendalian Stok &amp; Bahan Baku
          </h3>
          <p className="text-xs text-[#73777f]">Pastikan stok masakan kuliner aman di atas ambang kritis.</p>
        </div>

        <button
          onClick={() => openModal('TAMBAH')}
          className="px-4 py-2 bg-[#006c4e] text-white rounded-lg font-bold text-xs hover:bg-[#00513a] flex items-center gap-1 transition-colors"
        >
          <Plus size={16} />
          <span>Tambah Bahan Baku</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard 
          title="TOTAL BAHAN BAKU" 
          value={`${bahanBaku.length} Item`} 
          subtitle="+3 dari bulan lalu"
          subtitleColorClass="text-teal-500"
          topBorderColor="indigo"
        />
        <StatCard 
          title="STOK KRITIS" 
          value={`${bahanBaku.filter(b => b.stok <= b.stokMinimum).length} Item`} 
          subtitle="Butuh perhatian segera"
          subtitleColorClass="text-red-500"
          topBorderColor="danger"
        />
        <StatCard 
          title="NILAI PERSEDIAAN" 
          value={formatRupiah(totalNilaiPersediaan)}
          subtitle="Total aset bahan"
          subtitleColorClass="text-neutral-400"
          topBorderColor="success"
        />
        <StatCard 
          title="BARANG MASUK HARI INI" 
          value="5 Transaksi" 
          subtitle="12 Item baru ditambahkan"
          subtitleColorClass="text-neutral-400"
          topBorderColor="indigo"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Status Ketersediaan">
          <div className="h-56 mt-4 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dynamicPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {dynamicPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${value} item`, 'Jumlah']}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Custom Legend */}
            <div className="absolute bottom-0 w-full flex justify-center gap-4">
              {dynamicPieData.map((entry, index) => (
                <div key={index} className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
                  <span className="text-[10px] text-neutral-500 font-medium">{entry.name} ({entry.value})</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card 
          title="Riwayat Aktivitas" 
          action={
            <button 
              onClick={() => openModal('FULL_RIWAYAT')}
              className="text-[11px] font-medium text-teal-600 hover:text-teal-700"
            >
              Lihat Detail
            </button>
          }
        >
          <div className="mt-4 space-y-4">
            {riwayat.slice(0, 5).map((log) => {
              const logStyle = getLogIcon(log.aksi);
              return (
                <div key={log.id} className="flex items-start gap-3 border-b border-neutral-50 pb-3 last:border-0 last:pb-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${logStyle.bg} ${logStyle.text}`}>
                    {logStyle.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-neutral-700 font-medium leading-snug">{log.aksi.replace('[PERSEDIAAN] ', '')}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-neutral-400 font-medium">{log.pengguna?.nama || 'Sistem'}</span>
                      <span className="text-[10px] text-neutral-300">•</span>
                      <span className="text-[10px] text-neutral-400">{new Date(log.waktu).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              );
            })}
            {riwayat.length === 0 && (
              <p className="text-xs text-neutral-500 text-center py-4">Belum ada aktivitas tercatat</p>
            )}
          </div>
        </Card>
      </div>

      <Card 
        title="Daftar Bahan Baku" 
        action={
          <div className="flex gap-2">
            <button onClick={async () => {
              if (filteredBahanBaku.length === 0) { toast.error('Tidak ada data'); return; }
              const cols = [
                { header: 'ID', key: 'id', format: (v) => `#${v}` },
                { header: 'Nama Bahan', key: 'namaBahan' },
                { header: 'Kategori', key: 'kategori', format: (v) => v ? v.replace('_', ' ') : '-' },
                { header: 'Stok', key: 'stok', format: (v) => Number(v) },
                { header: 'Satuan', key: 'satuan' },
                { header: 'Min. Stok', key: 'stokMinimum', format: (v) => Number(v || 0) },
                { header: 'Harga Satuan (Rp)', key: 'hargaSatuan', format: (v) => Number(v || 0) },
                { header: 'Status', key: 'status' },
              ];
              try {
                await exportToExcel(filteredBahanBaku, cols, `persediaan_${new Date().toISOString().split('T')[0]}`, 'Persediaan');
                toast.success('File Excel berhasil di-download');
              } catch (e) { toast.error('Gagal mengekspor Excel'); }
            }} className="px-3 py-1.5 border border-green-500 text-green-600 rounded-md text-[11px] font-medium bg-green-50 hover:bg-green-100">Ekspor Excel</button>
            <button onClick={() => {
              if (filteredBahanBaku.length === 0) { toast.error('Tidak ada data'); return; }
              const cols = [
                { header: 'ID', key: 'id', format: (v) => `#${v}` },
                { header: 'Nama Bahan', key: 'namaBahan' },
                { header: 'Kategori', key: 'kategori', format: (v) => v ? v.replace('_', ' ') : '-' },
                { header: 'Stok', key: 'stok', format: (v) => Number(v) },
                { header: 'Satuan', key: 'satuan' },
                { header: 'Min. Stok', key: 'stokMinimum', format: (v) => Number(v || 0) },
                { header: 'Harga Satuan', key: 'hargaSatuan', format: (v) => formatRupiah(v) },
                { header: 'Status', key: 'status' },
              ];
              exportToPDF(filteredBahanBaku, cols, `persediaan_${new Date().toISOString().split('T')[0]}`, {
                title: 'Laporan Persediaan Bahan Baku',
                subtitle: `Total ${filteredBahanBaku.length} item — Nilai persediaan: ${formatRupiah(filteredBahanBaku.reduce((a, b) => a + Number(b.stok || 0) * Number(b.hargaSatuan || 0), 0))}`,
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
            placeholder="Cari bahan baku..." 
            className="flex-1 min-w-[200px] px-3 py-1.5 border border-[#c3c6cf] rounded-md text-sm outline-none focus:border-[#002444] text-[#191c1e] transition-colors" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select 
            className="px-3 py-1.5 border border-[#c3c6cf] rounded-md text-sm bg-white outline-none focus:border-[#002444] text-[#191c1e] transition-colors cursor-pointer"
            value={filterKategori}
            onChange={(e) => setFilterKategori(e.target.value)}
          >
            <option value="">Semua Kategori</option>
            <option value="BAHAN_POKOK">Bahan Pokok</option>
            <option value="BAHAN_MINUMAN">Bahan Minuman</option>
            <option value="BUMBU">Bumbu</option>
            <option value="MINUMAN">Minuman</option>
            <option value="LAINNYA">Lainnya</option>
          </select>
          <select 
            className="px-3 py-1.5 border border-[#c3c6cf] rounded-md text-sm bg-white outline-none focus:border-[#002444] text-[#191c1e] transition-colors cursor-pointer"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">Semua Status</option>
            <option value="Aman">Aman</option>
            <option value="Kritis">Kritis/Menipis</option>
            <option value="Habis">Habis</option>
          </select>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse bg-white">
            <thead>
              <tr className="bg-[#f8f9fb] border-b border-[#c3c6cf]/30 text-[#43474e]">
                <th className="py-3 px-6 font-semibold">ID</th>
                <th 
                  className="py-3 px-6 font-semibold cursor-pointer hover:bg-neutral-100 transition-colors select-none"
                  onClick={() => requestSort('namaBahan')}
                >
                  <div className="flex items-center gap-2">
                    BAHAN BAKU METRIC
                    {getSortIcon('namaBahan')}
                  </div>
                </th>
                <th 
                  className="py-3 px-6 font-semibold cursor-pointer hover:bg-neutral-100 transition-colors select-none text-center"
                  onClick={() => requestSort('stok')}
                >
                  <div className="flex items-center justify-center gap-2">
                    STOK SAAT INI
                    {getSortIcon('stok')}
                  </div>
                </th>
                <th className="py-3 px-6 font-semibold text-center">TAKARAN</th>
                <th 
                  className="py-3 px-6 font-semibold cursor-pointer hover:bg-neutral-100 transition-colors select-none text-center"
                  onClick={() => requestSort('stokMinimum')}
                >
                  <div className="flex items-center justify-center gap-2">
                    BATAS AMBANG AMAN
                    {getSortIcon('stokMinimum')}
                  </div>
                </th>
                <th 
                  className="py-3 px-6 font-semibold cursor-pointer hover:bg-neutral-100 transition-colors select-none text-center"
                  onClick={() => requestSort('hargaSatuan')}
                >
                  <div className="flex items-center justify-center gap-2">
                    HARGA SATUAN
                    {getSortIcon('hargaSatuan')}
                  </div>
                </th>
                <th className="py-3 px-6 font-semibold text-center">INDIKATOR STATUS</th>
                <th className="py-3 px-6 font-semibold text-center">TINDAKAN RESTOK</th>
                <th className="py-3 px-6 font-semibold text-right">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c3c6cf]/20 font-medium text-neutral-600">
              {sortedBahanBaku.length > 0 ? (
                sortedBahanBaku.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((item, idx) => (
                  <tr key={item.id} className="hover:bg-[#f8f9fb] transition-colors">
                    <td className="py-4 px-6 text-xs text-[#1e3251] font-semibold">#{item.id || `B-00${idx+1}`}</td>
                    <td className="py-4 px-6 text-xs text-[#002444] font-bold">
                      <div>{item.namaBahan}</div>
                      <div className="text-[10px] text-neutral-400 font-normal uppercase tracking-wide mt-0.5">
                        {item.kategori ? item.kategori.replace('_', ' ') : 'BAHAN POKOK'}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center font-mono font-bold text-sm text-[#191c1e]">
                      {item.stok}
                    </td>
                    <td className="py-4 px-6 text-center text-[#73777f] uppercase font-bold text-[10px]">
                      {item.satuan}
                    </td>
                    <td className="py-4 px-6 text-center font-mono text-[#73777f]">
                      {item.stokMinimum || 0} {item.satuan}
                    </td>
                    <td className="py-4 px-6 text-center font-mono text-xs text-neutral-500">
                      {formatRupiah(item.hargaSatuan || 0)}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {getStatusBadge(item.stok, item.stokMinimum || 0)}
                    </td>
                    <td className="py-3 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          disabled={restockingId === `${item.id}-10`}
                          onClick={() => handleQuickRestock(item, 10)}
                          className={`px-2.5 py-1 bg-[#edeef0] text-[#002444] rounded hover:bg-[#c3c6cf]/50 font-bold text-[11px] border border-[#c3c6cf]/50 transition-colors ${
                            restockingId === `${item.id}-10` ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          {restockingId === `${item.id}-10` ? '...' : '+10'}
                        </button>
                        <button
                          disabled={restockingId === `${item.id}-50`}
                          onClick={() => handleQuickRestock(item, 50)}
                          className={`px-2.5 py-1 bg-[#002444] text-white rounded hover:bg-[#1a3a5c] font-bold text-[11px] transition-colors ${
                            restockingId === `${item.id}-50` ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          {restockingId === `${item.id}-50` ? '...' : '+50'}
                        </button>
                      </div>
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
                          onClick={() => openModal('HAPUS', item)} 
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
                  <td colSpan="9" className="py-8 text-center text-xs text-neutral-500">
                    Tidak ada data persediaan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination 
          totalItems={sortedBahanBaku.length} 
          itemsPerPage={itemsPerPage} 
          currentPage={currentPage} 
          onPageChange={setCurrentPage} 
        />
      </Card>

      {/* Modal Update Stok (Restock) */}
      <Modal 
        isOpen={activeModal === 'UPDATE'} 
        onClose={closeModal} 
        title={`Tambah Stok - ${selectedItem?.namaBahan}`}
        footer={
          <>
            <Button variant="outline" disabled={isSubmitting} onClick={closeModal}>Batal</Button>
            <Button variant="primary" disabled={isSubmitting} onClick={handleSubmitUpdate}>
              {isSubmitting ? 'Menyimpan...' : 'Simpan Stok'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100 flex justify-between items-center">
            <span className="text-sm text-neutral-600">Stok Saat Ini:</span>
            <span className="font-bold text-lg text-[#1e3251]">{selectedItem?.stok} <span className="text-sm font-normal text-neutral-500">{selectedItem?.satuan}</span></span>
          </div>
          <Input 
            label={`Jumlah Tambahan (${selectedItem?.satuan})`} 
            type="number" 
            placeholder="Contoh: 10"
            value={formData.jumlah || ''}
            onChange={(e) => setFormData({...formData, jumlah: e.target.value})}
            min="0.01"
            step="0.01"
            required
          />
        </div>
      </Modal>

      {/* Modal Edit/Tambah Barang */}
      <Modal 
        isOpen={activeModal === 'EDIT' || activeModal === 'TAMBAH'} 
        onClose={closeModal} 
        title={activeModal === 'EDIT' ? `Edit Data Barang` : 'Tambah Barang Baru'}
        size="lg"
        footer={
          <>
            <Button variant="outline" disabled={isSubmitting} onClick={closeModal}>Batal</Button>
            <Button variant="primary" disabled={isSubmitting} onClick={activeModal === 'EDIT' ? handleSubmitEdit : handleSubmitTambah}>
              {isSubmitting ? 'Menyimpan...' : (activeModal === 'EDIT' ? 'Simpan Perubahan' : 'Tambah Barang')}
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input 
            label="Nama Bahan" 
            type="text" 
            value={formData.namaBahan || ''}
            onChange={(e) => setFormData({...formData, namaBahan: e.target.value})}
            placeholder="Contoh: Tepung Terigu"
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-neutral-700">Kategori</label>
            <select 
              className="px-3 py-2 border border-neutral-300 rounded-lg text-sm bg-white outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-shadow"
              value={formData.kategori || ''}
              onChange={(e) => setFormData({...formData, kategori: e.target.value})}
            >
              <option value="BAHAN_POKOK">Bahan Pokok</option>
              <option value="BAHAN_MINUMAN">Bahan Minuman</option>
              <option value="BUMBU">Bumbu</option>
              <option value="MINUMAN">Minuman</option>
              <option value="LAINNYA">Lainnya</option>
            </select>
          </div>
          <Input 
            label="Stok Awal" 
            type="number" 
            value={formData.stok || ''}
            onChange={(e) => setFormData({...formData, stok: e.target.value})}
            placeholder="0"
            step="0.01"
            min="0"
            disabled={activeModal === 'EDIT'} // Stok hanya diedit dari tombol Update
          />
          <Input 
            label="Satuan" 
            type="text" 
            value={formData.satuan || ''}
            onChange={(e) => setFormData({...formData, satuan: e.target.value})}
            placeholder="Kg, Liter, Butir, dll"
          />
          <Input 
            label="Batas Minimum Stok" 
            type="number" 
            value={formData.stokMinimum || ''}
            onChange={(e) => setFormData({...formData, stokMinimum: e.target.value})}
            placeholder="0"
            step="0.01"
            min="0"
          />
          <Input 
            label="Harga Satuan (Rp)" 
            type="number" 
            value={formData.hargaSatuan || ''}
            onChange={(e) => setFormData({...formData, hargaSatuan: e.target.value})}
            placeholder="0"
            min="0"
          />
        </div>
      </Modal>

      {/* Modal Konfirmasi Hapus */}
      <Modal 
        isOpen={activeModal === 'HAPUS'} 
        onClose={closeModal} 
        title="Konfirmasi Hapus"
        footer={
          <>
            <Button variant="outline" disabled={isSubmitting} onClick={closeModal}>Batal</Button>
            <button 
              disabled={isSubmitting}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-md text-sm font-medium transition-colors"
              onClick={handleSubmitHapus}
            >
              {isSubmitting ? 'Menghapus...' : 'Ya, Hapus'}
            </button>
          </>
        }
      >
        <div className="py-4 flex flex-col gap-2">
          <p className="text-neutral-600">
            Apakah Anda yakin ingin menghapus <span className="font-bold text-neutral-800">{selectedItem?.namaBahan}</span>?
          </p>
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-100">
            Peringatan: Tindakan ini permanen. Data stok dan riwayat yang terkait dengan bahan baku ini akan ikut terhapus dari sistem.
          </div>
        </div>
      </Modal>

      {/* Modal Full Riwayat */}
      <Modal 
        isOpen={activeModal === 'FULL_RIWAYAT'} 
        onClose={closeModal} 
        title="Detail Riwayat Aktivitas Persediaan"
        size="lg"
      >
        <div className="overflow-y-auto max-h-[60vh]">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-white shadow-sm z-10">
              <tr className="border-b border-neutral-100">
                <th className="py-3 px-4 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Waktu</th>
                <th className="py-3 px-4 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Pengguna</th>
                <th className="py-3 px-4 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Aktivitas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50 text-neutral-600">
              {riwayat.map((log) => (
                <tr key={log.id} className="even:bg-slate-50/50 hover:bg-slate-100/50 transition-colors">
                  <td className="py-3 px-4 text-xs whitespace-nowrap">{new Date(log.waktu).toLocaleString()}</td>
                  <td className="py-3 px-4 text-xs font-medium text-[#1e3251]">{log.pengguna?.nama || 'Sistem'}</td>
                  <td className="py-3 px-4 text-xs text-neutral-700">{log.aksi.replace('[PERSEDIAAN] ', '')}</td>
                </tr>
              ))}
              {riwayat.length === 0 && (
                <tr>
                  <td colSpan="3" className="py-8 text-center text-xs text-neutral-500">No data available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Modal>
    </div>
  );
};

export default Persediaan;
