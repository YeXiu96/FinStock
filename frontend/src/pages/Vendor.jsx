import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, Eye, Phone, Mail, MapPin, Truck, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axiosInstance from '../api/axiosInstance';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import Pagination from '../components/ui/Pagination';
import useSortableData from '../hooks/useSortableData';

const Vendor = () => {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal state
  const [activeModal, setActiveModal] = useState(null); // 'TAMBAH', 'EDIT', 'HAPUS'
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [formData, setFormData] = useState({ nama: '', alamat: '', telepon: '', email: '', catatan: '' });
  const [isSaving, setIsSaving] = useState(false);

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get('/vendor');
      setVendors(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch vendors', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredVendors = useMemo(() => {
    return vendors.filter(v => {
      const matchSearch = !searchTerm || 
        v.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (v.telepon && v.telepon.includes(searchTerm)) ||
        (v.email && v.email.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchStatus = !filterStatus || v.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [vendors, searchTerm, filterStatus]);

  const { items: sortedVendors, requestSort, sortConfig } = useSortableData(filteredVendors);

  // Reset currentPage to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, sortConfig?.key, sortConfig?.direction]);

  const getSortIcon = (columnKey) => {
    if (!sortConfig || sortConfig.key !== columnKey) {
      return <ArrowUpDown size={12} className="text-neutral-300" />;
    }
    return sortConfig.direction === 'ascending' 
      ? <ArrowUp size={12} className="text-[#002444]" />
      : <ArrowDown size={12} className="text-[#002444]" />;
  };

  const stats = useMemo(() => ({
    total: vendors.length,
    aktif: vendors.filter(v => v.status === 'AKTIF').length,
    nonaktif: vendors.filter(v => v.status === 'NONAKTIF').length,
  }), [vendors]);

  const openModal = (type, vendor = null) => {
    setActiveModal(type);
    setSelectedVendor(vendor);
    if (type === 'TAMBAH') {
      setFormData({ nama: '', alamat: '', telepon: '', email: '', catatan: '' });
    } else if (type === 'EDIT' && vendor) {
      setFormData({
        nama: vendor.nama || '',
        alamat: vendor.alamat || '',
        telepon: vendor.telepon || '',
        email: vendor.email || '',
        catatan: vendor.catatan || '',
        status: vendor.status || 'AKTIF',
      });
    }
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedVendor(null);
    setFormData({ nama: '', alamat: '', telepon: '', email: '', catatan: '' });
  };

  const handleSave = async () => {
    if (isSaving) return;
    if (!formData.nama.trim()) {
      toast.error('Nama vendor wajib diisi');
      return;
    }
    if (formData.email?.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      toast.error('Format email vendor tidak valid');
      return;
    }
    if (formData.telepon?.trim() && formData.telepon.trim().length < 8) {
      toast.error('Nomor telepon minimal 8 digit');
      return;
    }
    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        nama: formData.nama.trim(),
        email: formData.email?.trim() || null,
        telepon: formData.telepon?.trim() || null,
        alamat: formData.alamat?.trim() || null,
        catatan: formData.catatan?.trim() || null,
      };
      if (activeModal === 'TAMBAH') {
        await axiosInstance.post('/vendor', payload);
        toast.success('Vendor berhasil ditambahkan');
      } else if (activeModal === 'EDIT') {
        await axiosInstance.put(`/vendor/${selectedVendor.id}`, payload);
        toast.success('Vendor berhasil diperbarui');
      }
      closeModal();
      fetchVendors();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menyimpan vendor');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      await axiosInstance.delete(`/vendor/${selectedVendor.id}`);
      toast.success('Vendor berhasil dihapus');
      closeModal();
      fetchVendors();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menghapus vendor');
    } finally {
      setIsSaving(false);
    }
  };

  const StatCard = ({ title, value, subtitle, subtitleColorClass, topBorderColor }) => (
    <Card topBorderColor={topBorderColor} className="flex flex-col justify-center py-5 px-6">
      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2">{title}</p>
      <h4 className="text-2xl font-bold text-neutral-800 leading-none mb-2">{value}</h4>
      <p className={`text-[11px] font-medium ${subtitleColorClass}`}>{subtitle}</p>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#002444]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      {/* Vendor header */}
      <div className="flex justify-between items-center bg-white p-5 rounded-xl border border-[#c3c6cf]/30 shadow-sm">
        <div>
          <h3 className="text-sm font-bold text-[#002444] uppercase tracking-wider mb-1">
            Mitra Kerja &amp; Vendor Supplier
          </h3>
          <p className="text-xs text-[#73777f]">Kelola data pemasok bahan baku, informasi kontak, dan kontrak produk kemitraan.</p>
        </div>

        <button
          onClick={() => openModal('TAMBAH')}
          className="px-4 py-2 bg-[#006c4e] text-white rounded-lg font-bold text-xs hover:bg-[#00513a] flex items-center gap-1 transition-colors"
        >
          <Plus size={16} />
          <span>Tambah Vendor</span>
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard 
          title="TOTAL VENDOR" 
          value={`${stats.total} Vendor`}
          subtitle="Terdaftar di sistem"
          subtitleColorClass="text-teal-500"
          topBorderColor="indigo"
        />
        <StatCard 
          title="VENDOR AKTIF" 
          value={`${stats.aktif} Vendor`}
          subtitle="Masih bekerja sama"
          subtitleColorClass="text-teal-500"
          topBorderColor="success"
        />
        <StatCard 
          title="VENDOR NONAKTIF" 
          value={`${stats.nonaktif} Vendor`}
          subtitle="Tidak aktif"
          subtitleColorClass="text-neutral-400"
          topBorderColor="warning"
        />
      </div>

      {/* Vendor Table */}
      <Card title="Daftar Vendor / Supplier" noPadding>
        {/* Filters */}
        <div className="p-4 border-b border-[#c3c6cf]/30 flex flex-wrap gap-3 bg-white">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Cari nama, telepon, atau email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-[#c3c6cf] rounded-md text-sm outline-none focus:border-[#002444] text-[#191c1e] transition-colors"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 border border-[#c3c6cf] rounded-md text-sm bg-white outline-none focus:border-[#002444] text-[#191c1e] transition-colors cursor-pointer"
          >
            <option value="">Semua Status</option>
            <option value="AKTIF">Aktif</option>
            <option value="NONAKTIF">Nonaktif</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse bg-white">
            <thead>
              <tr className="bg-[#f8f9fb] border-b border-[#c3c6cf]/30 text-[#43474e]">
                <th 
                  className="py-3 px-6 font-semibold cursor-pointer hover:bg-neutral-100 transition-colors select-none"
                  onClick={() => requestSort('nama')}
                >
                  <div className="flex items-center gap-2">
                    VENDOR
                    {getSortIcon('nama')}
                  </div>
                </th>
                <th className="py-3 px-6 font-semibold">KONTAK</th>
                <th className="py-3 px-6 font-semibold">ALAMAT</th>
                <th 
                  className="py-3 px-6 font-semibold text-center cursor-pointer hover:bg-neutral-100 transition-colors select-none"
                  onClick={() => requestSort('_count.produk')}
                >
                  <div className="flex items-center justify-center gap-2">
                    PRODUK
                    {getSortIcon('_count.produk')}
                  </div>
                </th>
                <th 
                  className="py-3 px-6 font-semibold cursor-pointer hover:bg-neutral-100 transition-colors select-none"
                  onClick={() => requestSort('status')}
                >
                  <div className="flex items-center gap-2">
                    STATUS
                    {getSortIcon('status')}
                  </div>
                </th>
                <th className="py-3 px-6 font-semibold text-right">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c3c6cf]/20 font-medium text-neutral-600">
              {sortedVendors.length > 0 ? sortedVendors.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((vendor) => (
                <tr key={vendor.id} className="hover:bg-[#f8f9fb] transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#002444] to-[#1a3a5c] flex items-center justify-center text-white font-bold text-xs shrink-0">
                        {vendor.nama.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#002444]">{vendor.nama}</p>
                        <p className="text-[10px] text-neutral-400 mt-0.5">ID: #V-{String(vendor.id).padStart(3, '0')}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="space-y-1">
                      {vendor.telepon && (
                        <div className="flex items-center gap-1.5 text-[11px] text-neutral-500">
                          <Phone size={11} className="text-neutral-400" />
                          {vendor.telepon}
                        </div>
                      )}
                      {vendor.email && (
                        <div className="flex items-center gap-1.5 text-[11px] text-neutral-500">
                          <Mail size={11} className="text-neutral-400" />
                          {vendor.email}
                        </div>
                      )}
                      {!vendor.telepon && !vendor.email && (
                        <span className="text-[11px] text-neutral-300">-</span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-start gap-1.5 max-w-[180px]">
                      {vendor.alamat ? (
                        <>
                          <MapPin size={12} className="text-neutral-400 mt-0.5 shrink-0" />
                          <span className="text-[11px] text-neutral-500 line-clamp-2">{vendor.alamat}</span>
                        </>
                      ) : (
                        <span className="text-[11px] text-neutral-300">-</span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-50 text-blue-700 text-xs font-bold font-mono">
                      {vendor._count?.produk || 0}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-[10px] font-bold w-24 ${
                      vendor.status === 'AKTIF' 
                        ? 'bg-[#83f5c6] text-[#006c4e]' 
                        : 'bg-[#ffdad6] text-[#ba1a1a]'
                    }`}>
                      {vendor.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => navigate(`/vendor/${vendor.id}`)}
                        className="p-1.5 text-neutral-400 hover:text-[#002444] hover:bg-neutral-100 rounded-md transition-colors"
                        title="Lihat Detail"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => openModal('EDIT', vendor)}
                        className="p-1.5 text-neutral-400 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => openModal('HAPUS', vendor)}
                        className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Hapus"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="py-12 text-center">
                    <Truck size={32} className="mx-auto text-neutral-300 mb-3" />
                    <p className="text-sm text-neutral-400">No data available.</p>
                    <p className="text-xs text-neutral-300 mt-1">Klik "Tambah Vendor" untuk menambah vendor baru</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination 
          totalItems={sortedVendors.length} 
          itemsPerPage={itemsPerPage} 
          currentPage={currentPage} 
          onPageChange={setCurrentPage} 
        />
      </Card>

      {/* Modal Tambah / Edit */}
      <Modal
        isOpen={activeModal === 'TAMBAH' || activeModal === 'EDIT'}
        onClose={closeModal}
        title={activeModal === 'TAMBAH' ? 'Tambah Vendor Baru' : 'Edit Vendor'}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={closeModal}>Batal</Button>
            <Button variant="primary" onClick={handleSave} isLoading={isSaving}>
              {activeModal === 'TAMBAH' ? 'Simpan' : 'Perbarui'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Nama Vendor <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={formData.nama}
              onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
              placeholder="Contoh: PT. Sumber Makmur"
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm outline-none focus:border-[#002444] focus:ring-1 focus:ring-[#002444] bg-white transition-colors"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Telepon</label>
              <input
                type="text"
                value={formData.telepon}
                onChange={(e) => setFormData({ ...formData, telepon: e.target.value })}
                placeholder="08xxxxxxxxxx"
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm outline-none focus:border-[#002444] focus:ring-1 focus:ring-[#002444] bg-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="vendor@email.com"
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm outline-none focus:border-[#002444] focus:ring-1 focus:ring-[#002444] bg-white transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Alamat</label>
            <textarea
              value={formData.alamat}
              onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
              placeholder="Alamat lengkap vendor..."
              rows={2}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm outline-none focus:border-[#002444] focus:ring-1 focus:ring-[#002444] bg-white transition-colors resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Catatan</label>
            <textarea
              value={formData.catatan}
              onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
              placeholder="Catatan tambahan..."
              rows={2}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm outline-none focus:border-[#002444] focus:ring-1 focus:ring-[#002444] bg-white transition-colors resize-none"
            />
          </div>
          {activeModal === 'EDIT' && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm outline-none focus:border-[#002444] bg-white cursor-pointer"
              >
                <option value="AKTIF">Aktif</option>
                <option value="NONAKTIF">Nonaktif</option>
              </select>
            </div>
          )}
        </div>
      </Modal>

      {/* Modal Hapus */}
      <Modal
        isOpen={activeModal === 'HAPUS'}
        onClose={closeModal}
        title="Hapus Vendor"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={closeModal}>Batal</Button>
            <Button variant="danger" onClick={handleDelete} isLoading={isSaving}>Hapus</Button>
          </>
        }
      >
        <p className="text-sm text-neutral-600">
          Apakah Anda yakin ingin menghapus vendor <strong>{selectedVendor?.nama}</strong>?
        </p>
        <p className="text-xs text-red-500 mt-2">
          Semua data produk yang terkait dengan vendor ini juga akan ikut terhapus.
        </p>
      </Modal>
    </div>
  );
};

export default Vendor;
