import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Minus, Trash2, Save, ShoppingCart, CheckCircle, Printer, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { exportStrukPDF } from '../utils/exportUtils';
import axiosInstance from '../api/axiosInstance';
import { formatRupiah } from '../utils/formatRupiah';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';

const Kasir = () => {
  const navigate = useNavigate();
  const [menus, setMenus] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Cart state
  const [cart, setCart] = useState([]);

  // Right Column customer & payment states
  const [customerName, setCustomerName] = useState('');
  const [tableNo, setTableNo] = useState('');
  const [orderType, setOrderType] = useState('Dine In');
  const [paymentMethod, setPaymentMethod] = useState('TUNAI');
  const [paymentStatus, setPaymentStatus] = useState('Lunas');
  const [additionalCatatan, setAdditionalCatatan] = useState('');

  // Success Modal state
  const [successTx, setSuccessTx] = useState(null);

  // Format dynamic Indonesian date
  const getIndonesianDate = () => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const date = new Date();
    const dayName = days[date.getDay()];
    const day = date.getDate();
    const monthName = months[date.getMonth()];
    const year = date.getFullYear();
    return `${dayName}, ${day} ${monthName} ${year}`;
  };

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const response = await axiosInstance.get('/menu');
        const availableMenus = response.data.data.filter(m => m.isAvailable !== false);
        setMenus(availableMenus);
      } catch (error) {
        console.error('Failed to fetch menus', error);
        toast.error('Gagal mengambil daftar menu');
      } finally {
        setIsLoading(false);
      }
    };
    fetchMenus();
  }, []);

  const addToCart = (menu) => {
    const existingIndex = cart.findIndex(item => item.menuId === menu.id);
    if (existingIndex > -1) {
      const updated = [...cart];
      updated[existingIndex].qty += 1;
      setCart(updated);
    } else {
      setCart([...cart, { 
        menuId: menu.id, 
        nama: menu.nama, 
        hargaSatuan: Number(menu.harga), 
        qty: 1,
        notes: ''
      }]);
    }
  };

  const updateQty = (menuId, newQty) => {
    if (newQty < 1) {
      removeFromCart(menuId);
      return;
    }
    setCart(cart.map(item => 
      item.menuId === menuId ? { ...item, qty: newQty } : item
    ));
  };

  const removeFromCart = (menuId) => {
    setCart(cart.filter(item => item.menuId !== menuId));
  };

  const updateNotes = (menuId, notesText) => {
    setCart(cart.map(item =>
      item.menuId === menuId ? { ...item, notes: notesText } : item
    ));
  };

  const handleResetKasir = () => {
    setCart([]);
    setCustomerName('');
    setTableNo('');
    setOrderType('Dine In');
    setPaymentMethod('TUNAI');
    setPaymentStatus('Lunas');
    setAdditionalCatatan('');
    setSuccessTx(null);
  };

  const handleCetakNota = () => {
    if (successTx) {
      exportStrukPDF(successTx);
      toast.success('Nota sedang diunduh');
      handleResetKasir();
    }
  };

  const handleSubmit = async (shouldPrint = false) => {
    if (isSubmitting) return;
    if (cart.length === 0) {
      toast.error('Belum ada menu yang dipilih');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        items: cart.map(item => ({
          menuId: item.menuId,
          qty: item.qty,
          hargaSatuan: item.hargaSatuan
        })),
        metode: paymentMethod,
        catatan: additionalCatatan.trim() !== '' ? additionalCatatan : null,
        namaPelanggan: customerName.trim() !== '' ? customerName : 'Pelanggan Umum',
        status: 'SELESAI'
      };

      const response = await axiosInstance.post('/transaksi', payload);
      toast.success('Transaksi berhasil disimpan');
      
      const savedTrx = response.data.data;
      setSuccessTx(savedTrx);

      if (shouldPrint) {
        exportStrukPDF(savedTrx);
        toast.success('Nota sedang diunduh');
        handleResetKasir();
      }
    } catch (error) {
      console.error('Failed to save transaction', error);
      const msg = error.response?.data?.message || 'Gagal menyimpan transaksi';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + (item.hargaSatuan * item.qty), 0);

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#002444]"></div>
      </div>
    );
  }

  // Group available menus by category
  const categories = ['MAKANAN', 'MINUMAN', 'SNACK'];
  const menuByCategory = categories.map(cat => ({
    name: cat,
    items: menus.filter(m => m.kategori?.toUpperCase() === cat && m.isAvailable !== false)
  })).filter(c => c.items.length > 0);

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex justify-between items-center bg-white p-5 rounded-xl border border-[#c3c6cf]/30 shadow-sm">
        <div>
          <h3 className="text-sm font-bold text-[#002444] uppercase tracking-wider mb-1">
            Kasir / Pencatatan Transaksi
          </h3>
          <p className="text-xs text-[#73777f]">Pilih menu makanan atau minuman, sesuaikan kuantitas pesanan, dan catat transaksi POS secara langsung.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Menu Items Selection Grid (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {menuByCategory.map((category) => (
            <div key={category.name} className="bg-white rounded-xl p-5 border border-[#c3c6cf]/30 shadow-sm">
              <h3 className="text-xs font-bold text-[#002444] mb-4 uppercase tracking-wider border-b border-[#c3c6cf]/20 pb-2">
                {category.name}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {category.items.map(menu => {
                  const cartItem = cart.find(item => item.menuId === menu.id);
                  return (
                    <div 
                      key={menu.id}
                      onClick={() => addToCart(menu)}
                      className="bg-white border border-[#c3c6cf]/40 rounded-xl p-4 cursor-pointer hover:border-[#002444] hover:shadow-md transition-all flex flex-col justify-between min-h-[100px] relative group select-none"
                    >
                      <div className="font-bold text-xs text-[#002444] line-clamp-2 pr-4">{menu.nama}</div>
                      <div className="text-[11px] font-bold font-mono text-[#006c4e] mt-2">{formatRupiah(menu.harga)}</div>
                      {/* Quantity counter badge inside card */}
                      {cartItem && (
                        <span className="absolute top-2 right-2 w-5 h-5 bg-[#006c4e] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                          {cartItem.qty}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Checkout & Cart (5 cols) */}
        <div className="lg:col-span-5">
          <div className="flex flex-col gap-4 bg-white p-6 rounded-xl border border-[#c3c6cf]/30 shadow-sm sticky top-20">
            <h4 className="text-xs font-bold text-[#002444] uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-[#c3c6cf]/30">
              <ShoppingCart size={16} />
              Pesanan Saat Ini
            </h4>
            
            {/* Cart Items List */}
            <div className="max-h-60 overflow-y-auto divide-y divide-[#c3c6cf]/20 pr-1">
              {cart.length === 0 ? (
                <div className="text-center text-xs text-neutral-400 py-10">
                  Belum ada menu di keranjang. Klik menu di sebelah kiri untuk menambahkan.
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.menuId} className="py-3 flex flex-col gap-1.5">
                    {/* Baris 1: Nama Menu (kiri) & Counter Qty (kanan) */}
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-xs text-[#002444] truncate pr-2">{item.nama}</span>
                      
                      <div className="flex items-center bg-neutral-100 rounded-md overflow-hidden border border-[#c3c6cf]/20 shrink-0">
                        <button 
                          onClick={() => updateQty(item.menuId, item.qty - 1)}
                          className="px-2 py-0.5 hover:bg-[#edeef0] text-neutral-600 text-xs font-bold transition-colors"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-xs font-mono font-bold text-[#002444]">{item.qty}</span>
                        <button 
                          onClick={() => updateQty(item.menuId, item.qty + 1)}
                          className="px-2 py-0.5 hover:bg-[#edeef0] text-neutral-600 text-xs font-bold transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Baris 2: Harga Satuan (kiri) & Subtotal + Delete (kanan) */}
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-neutral-400 font-mono block">{formatRupiah(item.hargaSatuan)}</span>
                      
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-bold text-xs font-mono text-[#002444] w-20 text-right">
                          {formatRupiah(item.hargaSatuan * item.qty)}
                        </span>
                        <button 
                          onClick={() => removeFromCart(item.menuId)}
                          className="text-[#ba1a1a] hover:bg-[#ba1a1a]/10 p-1.5 rounded transition-transform hover:scale-105"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Checkout Form & Total Calculation */}
            <div className="border-t border-[#c3c6cf]/30 pt-4 space-y-4">
              
              {/* Total Tagihan */}
              <div className="flex justify-between items-center pt-2 border-t border-[#c3c6cf]/30">
                <span className="text-xs font-bold text-[#002444]">Total:</span>
                <span className="text-base font-bold font-mono text-[#002444]">{formatRupiah(subtotal)}</span>
              </div>

              {/* Metode Pembayaran Button Group */}
              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase font-bold text-[#73777f] mb-1">Metode Pembayaran</label>
                <div className="grid grid-cols-3 gap-2">
                  {['TUNAI', 'QRIS', 'TRANSFER'].map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`py-2 text-xs font-bold rounded-md border transition-all text-center cursor-pointer ${
                        paymentMethod === method
                          ? 'border-[#002444] text-[#002444] bg-[#002444]/5 font-extrabold'
                          : 'border-[#c3c6cf] text-[#73777f] hover:bg-neutral-50'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Nama Pelanggan */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-[#73777f] mb-1">Nama Pelanggan (opsional)</label>
                <input
                  type="text"
                  placeholder="Nama Pelanggan..."
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full text-xs h-8 px-2.5 border border-[#c3c6cf] bg-white rounded-md focus:border-[#002444] outline-none text-[#191c1e] transition-colors"
                />
              </div>

              {/* Input Catatan */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-[#73777f] mb-1">Catatan (opsional)</label>
                <input
                  type="text"
                  placeholder="Catatan..."
                  value={additionalCatatan}
                  onChange={(e) => setAdditionalCatatan(e.target.value)}
                  className="w-full text-xs h-8 px-2.5 border border-[#c3c6cf] bg-white rounded-md focus:border-[#002444] outline-none text-[#191c1e] transition-colors"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleSubmit(false)}
                  disabled={cart.length === 0 || isSubmitting}
                  className="flex-1 py-2.5 text-xs bg-[#002444] text-white rounded-lg font-bold hover:bg-[#1a3a5c] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Simpan Transaksi
                </button>
                <button
                  type="button"
                  onClick={() => handleSubmit(true)}
                  disabled={cart.length === 0 || isSubmitting}
                  className="flex-1 py-2.5 text-xs bg-[#006c4e] text-white rounded-lg font-bold hover:bg-[#00513a] transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Printer size={14} />
                  <span>Simpan &amp; Cetak</span>
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Success Modal */}
      <Modal
        isOpen={!!successTx}
        onClose={handleResetKasir}
        title="Transaksi Berhasil!"
      >
        <div className="flex flex-col items-center py-6 text-center">
          <div className="w-16 h-16 bg-[#83f5c6]/30 text-[#006c4e] rounded-full flex items-center justify-center mb-4">
            <CheckCircle size={32} />
          </div>
          <h3 className="text-xl font-bold text-[#002444] mb-1 font-mono">{successTx && formatRupiah(successTx.total)}</h3>
          <p className="text-sm text-neutral-500 mb-6">
            Pembayaran dengan {successTx?.metode} telah berhasil dicatat.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <button 
              className="flex-1 py-2.5 text-xs bg-[#edeef0] text-[#002444] font-bold rounded-lg border border-[#c3c6cf] hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              onClick={handleResetKasir}
            >
              <RefreshCw size={14} />
              <span>Transaksi Baru</span>
            </button>
            <button 
              className="flex-1 py-2.5 text-xs bg-[#006c4e] text-white font-bold rounded-lg hover:bg-[#00513a] transition-colors flex items-center justify-center gap-2 cursor-pointer"
              onClick={handleCetakNota}
            >
              <Printer size={14} />
              <span>Cetak Nota / Struk</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Kasir;
