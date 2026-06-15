import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axiosInstance from '../api/axiosInstance';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import ConfirmModal from '../components/ui/ConfirmModal';
import Pagination from '../components/ui/Pagination';
import { formatRupiah } from '../utils/formatRupiah';
import { exportToExcel, exportToPDF } from '../utils/exportUtils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList, Cell } from 'recharts';
import useSortableData from '../hooks/useSortableData';

const Transaksi = () => {
  const [transaksi, setTransaksi] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // State untuk Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterKasir, setFilterKasir] = useState('');
  const [filterMetode, setFilterMetode] = useState('');
  const [filterTanggal, setFilterTanggal] = useState('');
  const [confirmCancelId, setConfirmCancelId] = useState(null);

  // Remove static chart data
  useEffect(() => {
    fetchTransaksi();
  }, []);

  const fetchTransaksi = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get('/transaksi');
      setTransaksi(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch transaksi', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'SELESAI': return <Badge variant="success">Selesai</Badge>;
      case 'PENDING': return <Badge variant="warning">Pending</Badge>;
      case 'BATAL': return <Badge variant="danger">Batal</Badge>;
      default: return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const handleBatalkanClick = (id) => {
    setConfirmCancelId(id);
  };

  const executeBatalkan = async () => {
    if (!confirmCancelId) return;
    try {
      await axiosInstance.put(`/transaksi/${confirmCancelId}/status`, { status: 'BATAL' });
      toast.success('Transaksi berhasil dibatalkan');
      fetchTransaksi();
    } catch (error) {
      toast.error('Gagal membatalkan transaksi');
    } finally {
      setConfirmCancelId(null);
    }
  };

  const cetakTransaksi = async (id) => {
    try {
      const response = await axiosInstance.get(`/transaksi/${id}`);
      const { exportStrukPDF } = await import('../utils/exportUtils');
      exportStrukPDF(response.data.data);
      toast.success('Struk berhasil di-download');
    } catch (error) {
      toast.error('Gagal mencetak struk');
    }
  };

  const handleExportExcel = async () => {
    if (filteredTransaksi.length === 0) { toast.error('Tidak ada data untuk diekspor'); return; }
    const columns = [
      { header: 'Kode Transaksi', key: 'kodeTransaksi' },
      { header: 'Waktu', key: 'waktu', format: (v) => v ? new Date(v).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-' },
      { header: 'Kasir', key: 'kasir', format: (v) => v?.nama || '-' },
      { header: 'Item Dipesan', key: 'items', format: (v) => v?.map(i => `${i.menu?.nama || 'Item'} x${i.qty}`).join(', ') || '-' },
      { header: 'Metode', key: 'metode' },
      { header: 'Total (Rp)', key: 'total', format: (v) => Number(v || 0) },
      { header: 'Status', key: 'status' },
    ];
    try {
      await exportToExcel(filteredTransaksi, columns, `transaksi_${new Date().toISOString().split('T')[0]}`, 'Transaksi');
      toast.success('File Excel berhasil di-download');
    } catch (e) { toast.error('Gagal mengekspor Excel'); }
  };

  const handleExportPDF = () => {
    if (filteredTransaksi.length === 0) { toast.error('Tidak ada data untuk diekspor'); return; }
    const columns = [
      { header: 'Kode', key: 'kodeTransaksi' },
      { header: 'Waktu', key: 'waktu', format: (v) => v ? new Date(v).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-' },
      { header: 'Kasir', key: 'kasir', format: (v) => v?.nama || '-' },
      { header: 'Item', key: 'items', format: (v) => v?.map(i => `${i.menu?.nama} x${i.qty}`).join(', ') || '-' },
      { header: 'Metode', key: 'metode' },
      { header: 'Total', key: 'total', format: (v) => formatRupiah(v) },
      { header: 'Status', key: 'status' },
    ];
    exportToPDF(filteredTransaksi, columns, `transaksi_${new Date().toISOString().split('T')[0]}`, {
      title: 'Laporan Transaksi',
      subtitle: `Diekspor pada ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} — Total: ${filteredTransaksi.length} transaksi`,
    });
    toast.success('File PDF berhasil di-download');
  };

  const uniqueKasir = [...new Set(transaksi.map(t => t.kasir?.nama).filter(Boolean))];

  const filteredTransaksi = transaksi.filter(trx => {
    const searchString = `${trx.kodeTransaksi || ''} ${trx.kasir?.nama || ''} ${trx.items?.map(i => i.menu?.nama).join(' ')}`.toLowerCase();
    const matchesSearch = searchString.includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus ? trx.status === filterStatus : true;
    const matchesKasir = filterKasir ? trx.kasir?.nama === filterKasir : true;
    const matchesMetode = filterMetode ? trx.metode === filterMetode : true;
    
    let matchesTanggal = true;
    if (filterTanggal && trx.waktu) {
      const trxDate = new Date(trx.waktu).toISOString().split('T')[0];
      matchesTanggal = trxDate === filterTanggal;
    }

    return matchesSearch && matchesStatus && matchesKasir && matchesMetode && matchesTanggal;
  });

  const { items: sortedTransaksi, requestSort, sortConfig } = useSortableData(filteredTransaksi);

  // Reset currentPage to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, filterKasir, filterMetode, filterTanggal, sortConfig?.key, sortConfig?.direction]);

  const getSortIcon = (columnKey) => {
    if (!sortConfig || sortConfig.key !== columnKey) {
      return <ArrowUpDown size={12} className="text-neutral-300" />;
    }
    return sortConfig.direction === 'ascending' 
      ? <ArrowUp size={12} className="text-[#002444]" />
      : <ArrowDown size={12} className="text-[#002444]" />;
  };

  // Dynamic Dashboard Calculations
  const today = new Date().toISOString().split('T')[0];
  const todaysTransactions = transaksi.filter(t => t.waktu && t.waktu.startsWith(today) && t.status === 'SELESAI');
  const totalHariIni = todaysTransactions.length;
  const pendapatanHariIni = todaysTransactions.reduce((sum, t) => sum + parseFloat(t.total || 0), 0);
  const avgPendapatan = totalHariIni > 0 ? (pendapatanHariIni / totalHariIni) : 0;
  const tunaiHariIni = todaysTransactions.filter(t => t.metode === 'TUNAI').length;
  const qrisHariIni = todaysTransactions.filter(t => t.metode === 'QRIS').length;
  const pctTunai = totalHariIni > 0 ? Math.round((tunaiHariIni / totalHariIni) * 100) : 0;
  const pctQris = totalHariIni > 0 ? Math.round((qrisHariIni / totalHariIni) * 100) : 0;

  // Chart Data
  const dynamicChartData = [
    { hour: '08-09', count: 0, fill: '#002444' },
    { hour: '09-10', count: 0, fill: '#1a3a5c' },
    { hour: '10-11', count: 0, fill: '#006c4e' },
    { hour: '11-12', count: 0, fill: '#83f5c6' },
    { hour: '12-13', count: 0, fill: '#653e00' },
    { hour: '13-14', count: 0, fill: '#002444' },
    { hour: '14-15', count: 0, fill: '#1a3a5c' },
    { hour: '15-16', count: 0, fill: '#006c4e' }
  ];

  todaysTransactions.forEach(t => {
    const h = new Date(t.waktu).getHours();
    const index = h - 8;
    if (index >= 0 && index < 8) {
      dynamicChartData[index].count++;
    }
  });

  // Top Menus
  const menuStats = {};
  todaysTransactions.forEach(t => {
    t.items?.forEach(item => {
      const id = item.menuId || item.menu?.id;
      const name = item.menu?.nama || 'Unknown';
      if (!menuStats[id]) {
        menuStats[id] = { id, name, qty: 0, total: 0 };
      }
      menuStats[id].qty += item.qty;
      menuStats[id].total += (item.qty * parseFloat(item.hargaSatuan || 0));
    });
  });
  
  const menuTerlaris = Object.values(menuStats)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  const StatCard = ({ title, value, subtitle, subtitleColorClass, topBorderColor }) => (
    <Card topBorderColor={topBorderColor} className="flex flex-col justify-center py-5 px-6">
      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2">{title}</p>
      <h4 className="text-2xl font-bold text-neutral-800 leading-none mb-2">{value}</h4>
      <p className={`text-[11px] font-medium ${subtitleColorClass}`}>{subtitle}</p>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-5 rounded-xl border border-[#c3c6cf]/30 shadow-sm">
        <div>
          <h3 className="text-sm font-bold text-[#002444] uppercase tracking-wider mb-1">
            Riwayat Transaksi Penjualan
          </h3>
          <p className="text-xs text-[#73777f]">Pantau, filter, dan unduh laporan transaksi POS, cetak struk belanja, dan kelola status pembayaran.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard 
          title="TOTAL TRANSAKSI HARI INI" 
          value={totalHariIni.toString()} 
          subtitle="Selesai hari ini"
          subtitleColorClass="text-neutral-400"
          topBorderColor="primary"
        />
        <StatCard 
          title="PENDAPATAN HARI INI" 
          value={formatRupiah(pendapatanHariIni)} 
          subtitle={`Rata-rata ${formatRupiah(avgPendapatan)}/trx`}
          subtitleColorClass="text-[#006c4e]"
          topBorderColor="success"
        />
        <StatCard 
          title="TRANSAKSI TUNAI" 
          value={tunaiHariIni.toString()} 
          subtitle={`${pctTunai}% dari total`}
          subtitleColorClass="text-neutral-400"
          topBorderColor="warning"
        />
        <StatCard 
          title="TRANSAKSI QRIS" 
          value={qrisHariIni.toString()} 
          subtitle={`${pctQris}% dari total`}
          subtitleColorClass="text-[#006c4e]"
          topBorderColor="primary"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Frekuensi Transaksi per Jam">
          <div className="h-56 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dynamicChartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} interval={0} />
                <YAxis axisLine={false} tickLine={false} tick={false} />
                <Tooltip cursor={{ fill: 'transparent' }} />
                <Bar dataKey="count" radius={[2, 2, 0, 0]} barSize={28}>
                  <LabelList dataKey="count" position="top" style={{ fill: '#6b7280', fontSize: 10, fontWeight: 600 }} />
                  {dynamicChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Menu Terlaris Hari Ini">
          <div className="mt-4 space-y-4">
            {menuTerlaris.length > 0 ? (
              menuTerlaris.map((menu, idx) => (
                <div key={menu.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-neutral-100 flex items-center justify-center text-[11px] font-bold text-neutral-500">
                      {idx + 1}
                    </div>
                    <span className="text-sm text-neutral-700 font-medium">{menu.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-neutral-500">{menu.qty}x</span>
                    <span className="text-sm font-semibold text-[#002444] w-20 text-right">{formatRupiah(menu.total)}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-neutral-500 text-center py-4">Belum ada transaksi hari ini</div>
            )}
          </div>
        </Card>
      </div>

      <Card 
        title="Riwayat Transaksi" 
        action={
          <div className="flex gap-2">
            <button onClick={handleExportExcel} className="px-3 py-1.5 border border-[#006c4e] text-[#006c4e] rounded-md text-[11px] font-bold bg-[#006c4e]/5 hover:bg-[#006c4e]/10 transition-colors">Ekspor Excel</button>
            <button onClick={handleExportPDF} className="px-3 py-1.5 border border-[#ba1a1a] text-[#ba1a1a] rounded-md text-[11px] font-bold bg-[#ba1a1a]/5 hover:bg-[#ba1a1a]/10 transition-colors">Ekspor PDF</button>
          </div>
        }
        noPadding
      >
        <div className="p-4 border-b border-[#c3c6cf]/30 flex flex-wrap gap-3 bg-white">
          <input 
            type="text" 
            placeholder="Cari ID transaksi, kasir, atau menu..." 
            className="flex-1 min-w-[200px] px-3 py-1.5 border border-[#c3c6cf] rounded-md text-sm outline-none focus:border-[#002444] text-[#191c1e] transition-colors" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select 
            className="px-3 py-1.5 border border-[#c3c6cf] rounded-md text-sm bg-white outline-none focus:border-[#002444] text-[#191c1e] transition-colors cursor-pointer"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">Semua Status</option>
            <option value="SELESAI">Selesai</option>
            <option value="PENDING">Pending</option>
            <option value="BATAL">Batal</option>
          </select>
          <select 
            className="px-3 py-1.5 border border-[#c3c6cf] rounded-md text-sm bg-white outline-none focus:border-[#002444] text-[#191c1e] transition-colors cursor-pointer"
            value={filterKasir}
            onChange={(e) => setFilterKasir(e.target.value)}
          >
            <option value="">Semua Kasir</option>
            {uniqueKasir.map((kasir, idx) => (
              <option key={idx} value={kasir}>{kasir}</option>
            ))}
          </select>
          <select 
            className="px-3 py-1.5 border border-[#c3c6cf] rounded-md text-sm bg-white outline-none focus:border-[#002444] text-[#191c1e] transition-colors cursor-pointer"
            value={filterMetode}
            onChange={(e) => setFilterMetode(e.target.value)}
          >
            <option value="">Semua Metode</option>
            <option value="TUNAI">Tunai</option>
            <option value="QRIS">QRIS</option>
            <option value="TRANSFER">Transfer</option>
          </select>
          <input 
            type="date" 
            className="px-3 py-1.5 border border-[#c3c6cf] rounded-md text-sm bg-white outline-none focus:border-[#002444] text-[#191c1e] transition-colors cursor-pointer" 
            value={filterTanggal}
            onChange={(e) => setFilterTanggal(e.target.value)}
          />
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-[#f8f9fb] border-b border-[#c3c6cf]/30 text-[#43474e]">
                <th className="py-3 px-6 text-[10px] font-semibold tracking-wider">ID</th>
                <th 
                  className="py-3 px-6 text-[10px] font-semibold tracking-wider cursor-pointer hover:bg-neutral-200/50 transition-colors select-none"
                  onClick={() => requestSort('waktu')}
                >
                  <div className="flex items-center gap-2">
                    WAKTU
                    {getSortIcon('waktu')}
                  </div>
                </th>
                <th 
                  className="py-3 px-6 text-[10px] font-semibold tracking-wider cursor-pointer hover:bg-neutral-200/50 transition-colors select-none"
                  onClick={() => requestSort('kasir.nama')}
                >
                  <div className="flex items-center gap-2">
                    KASIR
                    {getSortIcon('kasir.nama')}
                  </div>
                </th>
                <th className="py-3 px-6 text-[10px] font-semibold tracking-wider">ITEM DIPESAN</th>
                <th 
                  className="py-3 px-6 text-[10px] font-semibold tracking-wider cursor-pointer hover:bg-neutral-200/50 transition-colors select-none"
                  onClick={() => requestSort('metode')}
                >
                  <div className="flex items-center gap-2">
                    METODE
                    {getSortIcon('metode')}
                  </div>
                </th>
                <th 
                  className="py-3 px-6 text-[10px] font-semibold tracking-wider cursor-pointer hover:bg-neutral-200/50 transition-colors select-none"
                  onClick={() => requestSort('total')}
                >
                  <div className="flex items-center gap-2">
                    TOTAL
                    {getSortIcon('total')}
                  </div>
                </th>
                <th 
                  className="py-3 px-6 text-[10px] font-semibold tracking-wider cursor-pointer hover:bg-neutral-200/50 transition-colors select-none"
                  onClick={() => requestSort('status')}
                >
                  <div className="flex items-center gap-2">
                    STATUS
                    {getSortIcon('status')}
                  </div>
                </th>
                <th className="py-3 px-6 text-[10px] font-semibold tracking-wider text-right">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c3c6cf]/20 text-neutral-600 font-medium">
              {sortedTransaksi.length > 0 ? (
                sortedTransaksi.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((trx) => (
                  <tr key={trx.id} className="hover:bg-[#f8f9fb] transition-colors">
                    <td className="py-3 px-6">
                      <div className="text-xs text-[#002444] font-bold font-mono">{trx.kodeTransaksi || `#T-${trx.id}`}</div>
                      {trx.namaPelanggan && (
                        <div className="text-[10px] text-neutral-500 mt-0.5">{trx.namaPelanggan}</div>
                      )}
                    </td>
                    <td className="py-3 px-6 text-xs text-neutral-600">
                      {trx.waktu ? new Date(trx.waktu).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}
                    </td>
                    <td className="py-3 px-6 text-xs">{trx.kasir?.nama || 'Kasir'}</td>
                    <td className="py-3 px-6 text-xs text-neutral-500">
                      {trx.items?.map(item => `${item.menu?.nama || 'Item'} x${item.qty || 1}`).join(', ') || 'Tidak ada item'}
                    </td>
                    <td className="py-3 px-6 text-xs">{trx.metode || '-'}</td>
                    <td className="py-3 px-6 text-xs font-bold font-mono text-[#002444]">{formatRupiah(trx.total || 0)}</td>
                    <td className="py-3 px-6">{getStatusBadge(trx.status)}</td>
                    <td className="py-3 px-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => navigate(`/transaksi/${trx.id}`)} 
                          className="text-[10px] font-medium text-[#002444] hover:text-white hover:bg-[#002444] border border-[#002444] px-3 py-1.5 rounded transition-colors"
                        >
                          Detail
                        </button>
                        {trx.status === 'PENDING' && (
                           <button 
                             onClick={() => handleBatalkanClick(trx.id)} 
                             className="text-[10px] font-medium text-[#ba1a1a] hover:text-white hover:bg-[#ba1a1a] border border-[#ba1a1a] px-3 py-1.5 rounded transition-colors"
                           >
                             Batalkan
                           </button>
                        )}
                        {trx.status === 'SELESAI' && (
                           <button 
                             onClick={() => cetakTransaksi(trx.id)} 
                             className="text-[10px] font-medium text-[#006c4e] hover:text-white hover:bg-[#006c4e] border border-[#006c4e] px-3 py-1.5 rounded transition-colors"
                           >
                             Cetak
                           </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="py-4 text-center text-xs text-neutral-500">
                    No data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination 
          totalItems={sortedTransaksi.length} 
          itemsPerPage={itemsPerPage} 
          currentPage={currentPage} 
          onPageChange={setCurrentPage} 
        />
      </Card>

      <ConfirmModal 
        isOpen={!!confirmCancelId}
        onClose={() => setConfirmCancelId(null)}
        title="Batalkan Transaksi"
        message="Yakin ingin membatalkan transaksi ini? Perubahan status ini akan mengembalikan stok bahan baku secara otomatis."
        confirmText="Ya, Batalkan"
        onConfirm={executeBatalkan}
      />
    </div>
  );
};

export default Transaksi;
