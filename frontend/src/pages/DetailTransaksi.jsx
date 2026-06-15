import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, FileText, CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import ConfirmModal from '../components/ui/ConfirmModal';
import { exportStrukPDF } from '../utils/exportUtils';
import axiosInstance from '../api/axiosInstance';
import { formatRupiah } from '../utils/formatRupiah';
import { formatTanggalWaktu } from '../utils/formatTanggal';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import useAuthStore from '../store/useAuthStore';

const DetailTransaksi = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [transaksi, setTransaksi] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmStatus, setConfirmStatus] = useState({ isOpen: false, newStatus: '' });
  const { user } = useAuthStore();

  const isOwner = user?.role === 'OWNER';

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    try {
      const response = await axiosInstance.get(`/transaksi/${id}`);
      setTransaksi(response.data.data);
    } catch (error) {
      console.error('Failed to fetch detail', error);
      toast.error('Gagal memuat detail transaksi');
      navigate('/transaksi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusClick = (newStatus) => {
    setConfirmStatus({ isOpen: true, newStatus });
  };

  const executeUbahStatus = async () => {
    const { newStatus } = confirmStatus;
    if (!newStatus) return;
    try {
      await axiosInstance.put(`/transaksi/${id}/status`, { status: newStatus });
      toast.success(`Status transaksi berhasil diubah menjadi ${newStatus}`);
      fetchDetail();
    } catch (error) {
      toast.error('Gagal mengubah status transaksi');
    } finally {
      setConfirmStatus({ isOpen: false, newStatus: '' });
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#002444]"></div></div>;
  }

  if (!transaksi) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-5 rounded-xl border border-[#c3c6cf]/30 shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/transaksi')}
            className="p-2 rounded-full hover:bg-[#002444]/5 text-[#002444] transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h3 className="text-sm font-bold text-[#002444] uppercase tracking-wider mb-1">
              Detail Transaksi Penjualan
            </h3>
            <p className="text-xs text-[#73777f]">Kode Transaksi: <span className="font-mono font-bold text-[#002444]">{transaksi.kodeTransaksi}</span></p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Status update buttons - ONLY FOR OWNER */}
          {isOwner && transaksi.status !== 'BATAL' && (
            <button 
              className="px-4 py-2 bg-[#ba1a1a] text-white rounded-lg font-bold text-xs hover:bg-[#ba1a1a]/90 flex items-center gap-1 transition-colors"
              onClick={() => handleStatusClick('BATAL')}
            >
              <XCircle size={16} /> <span>Batalkan</span>
            </button>
          )}
          
          <button 
            className="px-4 py-2 border border-[#002444] text-[#002444] rounded-lg font-bold text-xs bg-white hover:bg-[#002444]/5 flex items-center gap-2 transition-colors"
            onClick={() => {
              exportStrukPDF(transaksi);
              toast.success('Struk berhasil di-download');
            }}
          >
            <Printer size={16} /> <span>Cetak Struk</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card title="Daftar Pesanan">
            <div className="space-y-4">
              {transaksi.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-[#c3c6cf]/30 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#002444]/10 text-[#002444] flex items-center justify-center font-bold font-mono rounded-lg text-xs">
                      {item.qty}x
                    </div>
                    <div>
                      <h4 className="font-bold text-[#002444] text-xs">{item.menu.nama}</h4>
                      <p className="text-xs text-neutral-500 font-mono">{formatRupiah(item.hargaSatuan)}</p>
                    </div>
                  </div>
                  <div className="font-bold font-mono text-[#002444] text-xs">
                    {formatRupiah(item.subtotal)}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-4 border-t-2 border-[#c3c6cf]/30">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-neutral-800">Total Pembayaran</span>
                <span className="text-xl font-bold font-mono text-[#002444]">{formatRupiah(transaksi.total)}</span>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Informasi Transaksi">
            <div className="space-y-4">
              <div>
                <p className="text-xs text-neutral-500 mb-1">Status</p>
                {transaksi.status === 'SELESAI' && <Badge variant="success" className="text-xs py-1 px-3">Selesai</Badge>}
                {transaksi.status === 'PENDING' && <Badge variant="warning" className="text-xs py-1 px-3">Pending</Badge>}
                {transaksi.status === 'BATAL' && <Badge variant="danger" className="text-xs py-1 px-3">Dibatalkan</Badge>}
              </div>
              
              <div>
                <p className="text-xs text-neutral-500 mb-1">Tanggal & Waktu</p>
                <div className="flex items-center gap-2 text-neutral-800 font-medium text-xs">
                  <Clock size={16} className="text-neutral-400" />
                  {formatTanggalWaktu(transaksi.waktu)}
                </div>
              </div>
              
              <div>
                <p className="text-xs text-neutral-500 mb-1">Metode Pembayaran</p>
                <p className="text-[#002444] font-bold text-xs">{transaksi.metode}</p>
              </div>
              
              <div>
                <p className="text-xs text-neutral-500 mb-1">Kasir</p>
                <p className="text-[#002444] font-bold text-xs">{transaksi.kasir.nama}</p>
              </div>
              
              {transaksi.catatan && (
                <div>
                  <p className="text-xs text-neutral-500 mb-1">Catatan</p>
                  <div className="bg-neutral-50 p-3 rounded-lg text-xs text-neutral-700 italic border border-[#c3c6cf]/30">
                    "{transaksi.catatan}"
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      <ConfirmModal 
        isOpen={confirmStatus.isOpen}
        onClose={() => setConfirmStatus({ isOpen: false, newStatus: '' })}
        title="Ubah Status Transaksi"
        message={`Apakah Anda yakin ingin mengubah status menjadi ${confirmStatus.newStatus}?`}
        onConfirm={executeUbahStatus}
      />
    </div>
  );
};

export default DetailTransaksi;
