import React from 'react';
import { Menu } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const Navbar = ({ toggleSidebar }) => {
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    if (path.startsWith('/kasir')) return 'Kasir';
    if (path.startsWith('/transaksi/')) return 'Detail Transaksi';
    if (path.startsWith('/transaksi')) return 'Transaksi';
    if (path.startsWith('/menu')) return 'Daftar Menu';
    if (path.startsWith('/persediaan')) return 'Persediaan';
    if (path.startsWith('/laporan')) return 'Laporan';
    if (path.startsWith('/pengguna')) return 'Manajemen Pengguna';
    if (path.startsWith('/pengaturan')) return 'Pengaturan';
    if (path.startsWith('/vendor/')) return 'Detail Vendor';
    if (path.startsWith('/vendor')) return 'Manajemen Vendor';
    if (path.startsWith('/pengeluaran')) return 'Catatan Pengeluaran';
    return '';
  };

  const pageTitle = getPageTitle();

  // Format the date to match "Sabtu, 18 April 2026"
  const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const formattedDate = new Date().toLocaleDateString('id-ID', dateOptions);

  return (
    <header className="sticky top-0 bg-white/90 backdrop-blur-sm flex items-center justify-between px-6 lg:px-8 pt-4 pb-4 z-30 border-b border-neutral-100 mb-2">
      <div className="flex items-center gap-3">
        <button 
          onClick={toggleSidebar}
          className="text-neutral-500 hover:text-neutral-700 lg:hidden"
        >
          <Menu size={24} />
        </button>
        {pageTitle && (
          <h2 className="text-lg font-bold text-neutral-800">{pageTitle}</h2>
        )}
      </div>

      <div className="flex items-center">
        <div className="text-[13px] font-medium text-neutral-400 hidden md:block">
          {formattedDate}
        </div>
      </div>
    </header>
  );
};

export default Navbar;

