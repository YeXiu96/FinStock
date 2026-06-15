import { useState, useEffect } from 'react';
import { formatRupiah } from '../utils/formatRupiah';
import Card from '../components/ui/Card';
import axiosInstance from '../api/axiosInstance';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, LabelList } from 'recharts';
import useAuthStore from '../store/useAuthStore';
import Pagination from '../components/ui/Pagination';

const Dashboard = () => {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [stokKritis, setStokKritis] = useState([]);
  const [transaksiTerbaru, setTransaksiTerbaru] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [komposisi, setKomposisi] = useState([]);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const formatAngka = (value) => {
    if (value >= 1000000) return `${value / 1000000}Jt`;
    if (value >= 1000) return `${value / 1000}Rb`;
    return value;
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const [sumRes, stokRes, trxRes, grafikRes, lapRes] = await Promise.all([
          axiosInstance.get('/dashboard/summary'),
          axiosInstance.get('/dashboard/stok-kritis'),
          axiosInstance.get('/transaksi?limit=5'),
          axiosInstance.get('/dashboard/grafik'),
          axiosInstance.get('/laporan/keuangan?periode=harian')
        ]);
        
        setSummary(sumRes.data.data);
        setStokKritis(stokRes.data.data);
        setTransaksiTerbaru(trxRes.data.data || []);
        
        if (grafikRes.data.data) {
          setChartData(grafikRes.data.data.map(g => ({
            name: g.hari,
            Pendapatan: g.pendapatan,
            Pengeluaran: g.pengeluaran
          })));
        }

        if (lapRes.data.data?.komposisi) {
          setKomposisi(lapRes.data.data.komposisi);
        }
      } catch (error) {
        console.error('Gagal mengambil data dashboard', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const StatCard = ({ title, value, subtitle, subtitleColorClass, topBorderColor }) => (
    <Card topBorderColor={topBorderColor} className="flex flex-col justify-center py-5 px-6">
      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2">{title}</p>
      <h4 className="text-2xl font-bold text-neutral-800 leading-none mb-2">{value}</h4>
      <p className={`text-[11px] font-medium ${subtitleColorClass}`}>{subtitle}</p>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="PENDAPATAN HARI INI" 
          value={formatRupiah(summary?.totalPendapatan || 0)} 
          subtitle="Hari ini"
          subtitleColorClass="text-neutral-400"
          topBorderColor="indigo"
        />
        <StatCard 
          title="TRANSAKSI HARI INI" 
          value={summary?.totalTransaksi || 0} 
          subtitle="Hari ini"
          subtitleColorClass="text-neutral-400"
          topBorderColor="success"
        />
        <StatCard 
          title="TRANSAKSI TUNAI" 
          value={summary?.transaksiTunai || 0} 
          subtitle="Hari ini"
          subtitleColorClass="text-neutral-400"
          topBorderColor="warning"
        />
        <StatCard 
          title="TRANSAKSI QRIS" 
          value={summary?.transaksiQris || 0} 
          subtitle="Hari ini"
          subtitleColorClass="text-neutral-400"
          topBorderColor="indigo"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Top Left: Chart (Span 8) */}
        <div className="lg:col-span-8 h-full">
          <Card title="Pendapatan & Pengeluaran — 7 Hari Terakhir" className="h-full">
            <div className="h-64 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                  <YAxis axisLine={false} tickLine={false} tick={false} />
                  <Tooltip 
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Legend iconType="square" iconSize={8} wrapperStyle={{ fontSize: '11px', color: '#6b7280', paddingTop: '10px' }} />
                  <Bar dataKey="Pendapatan" fill="#002444" radius={[2, 2, 0, 0]} barSize={24}>
                    <LabelList dataKey="Pendapatan" position="top" formatter={formatAngka} style={{ fill: '#002444', fontSize: 10, fontWeight: 600 }} />
                  </Bar>
                  <Bar dataKey="Pengeluaran" fill="#ffb95d" radius={[2, 2, 0, 0]} barSize={24}>
                    <LabelList dataKey="Pengeluaran" position="top" formatter={formatAngka} style={{ fill: '#ffb95d', fontSize: 10, fontWeight: 600 }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Top Right: Stok & Komposisi (Span 4) */}
        <div className="lg:col-span-4 space-y-6">
          <Card title="Stok Bahan Baku">
            <div className="space-y-4 mt-2">
              {stokKritis.length > 0 ? stokKritis.slice(0, 4).map(item => {
                const max = Math.max(item.stok, item.stokMinimum * 2, 10);
                const pct = Math.min((item.stok / max) * 100, 100);
                const color = item.stok <= 0 ? 'bg-[#ba1a1a]' : (item.stok <= item.stokMinimum ? 'bg-[#653e00]' : 'bg-[#006c4e]');
                return (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-24 text-[11px] text-neutral-600 truncate">{item.namaBahan}</div>
                    <div className="flex-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                      <div className={`h-full ${color}`} style={{ width: `${pct}%` }}></div>
                    </div>
                    <div className="w-12 text-right text-[10px] text-neutral-400 font-mono">{item.stok} {item.satuan}</div>
                  </div>
                );
              }) : (
                <div className="text-[11px] text-neutral-400 text-center py-2">Semua stok aman</div>
              )}
            </div>
          </Card>

          <Card title="Komposisi Penjualan Hari Ini">
            <div className="space-y-3 mt-2">
              {komposisi.length > 0 ? komposisi.map((item, idx) => {
                const colors = ['bg-[#002444]', 'bg-[#006c4e]', 'bg-[#1a3a5c]', 'bg-[#ba1a1a]', 'bg-[#83f5c6]'];
                const color = colors[idx % colors.length];
                return (
                  <div key={item.kategori} className="flex items-center gap-3">
                    <div className="flex items-center gap-2 w-24">
                      <div className={`w-2 h-2 rounded-sm ${color}`}></div>
                      <span className="text-[11px] text-neutral-600 truncate">{item.kategori}</span>
                    </div>
                    <div className="flex-1 h-1 bg-neutral-100 rounded-full overflow-hidden">
                      <div className={`h-full ${color}`} style={{ width: `${item.persentase}%` }}></div>
                    </div>
                    <div className="w-10 text-right text-[11px] text-neutral-400 font-mono">{item.persentase}%</div>
                  </div>
                );
              }) : (
                <div className="text-[11px] text-neutral-400 text-center py-2">Belum ada data penjualan</div>
              )}
            </div>
          </Card>
        </div>

        {/* Bottom Full Width: Table (Span 12) */}
        <div className="lg:col-span-12">
          <Card title="Transaksi Terbaru Hari Ini" noPadding>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-[#f8f9fb] border-b border-[#c3c6cf]/30 text-[#43474e]">
                    <th className="py-3 px-6 font-semibold">ID TRANSAKSI</th>
                    <th className="py-3 px-6 font-semibold">WAKTU</th>
                    <th className="py-3 px-6 font-semibold">KASIR</th>
                    <th className="py-3 px-6 font-semibold">ITEM</th>
                    <th className="py-3 px-6 font-semibold">METODE</th>
                    <th className="py-3 px-6 font-semibold">TOTAL</th>
                    <th className="py-3 px-6 font-semibold text-center">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#c3c6cf]/20 font-medium text-neutral-600">
                  {transaksiTerbaru.length > 0 ? transaksiTerbaru.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((trx) => (
                    <tr key={trx.id} className="hover:bg-[#f8f9fb] transition-colors">
                      <td className="py-4 px-6 text-xs text-[#1e3251] font-semibold">{trx.kodeTransaksi || `#T-${trx.id}`}</td>
                      <td className="py-4 px-6 text-xs font-mono">{new Date(trx.waktu).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</td>
                      <td className="py-4 px-6 text-xs">{trx.kasir?.nama || '-'}</td>
                      <td className="py-4 px-6 text-xs text-neutral-500 truncate max-w-[250px]">{trx.items?.map(i => `${i.menu?.nama} x${i.qty}`).join(', ') || '-'}</td>
                      <td className="py-4 px-6 text-xs">{trx.metode}</td>
                      <td className="py-4 px-6 text-xs font-mono font-bold">{formatRupiah(trx.total)}</td>
                      <td className="py-4 px-6 text-center">
                        <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#83f5c6] text-[#006c4e]">
                          Selesai
                        </span>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="7" className="py-4 px-6 text-center text-xs text-neutral-500">Tidak ada transaksi.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <Pagination 
              totalItems={transaksiTerbaru.length} 
              itemsPerPage={itemsPerPage} 
              currentPage={currentPage} 
              onPageChange={setCurrentPage} 
            />
          </Card>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;

