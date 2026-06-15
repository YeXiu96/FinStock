import React from 'react';
import Card from '../components/ui/Card';
import useAuthStore from '../store/useAuthStore';

const Pengaturan = () => {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex justify-between items-center bg-white p-5 rounded-xl border border-[#c3c6cf]/30 shadow-sm">
        <div>
          <h3 className="text-sm font-bold text-[#002444] uppercase tracking-wider mb-1">
            Pengaturan Aplikasi & Profil
          </h3>
          <p className="text-xs text-[#73777f]">Preferensi akun, hak akses role, dan status sistem FinStock.</p>
        </div>
      </div>

      <Card title="Profil Pengguna">
        <div className="flex items-start gap-6">
          <div className="w-24 h-24 bg-[#002444]/10 rounded-full flex items-center justify-center text-[#002444] font-bold text-4xl shrink-0">
            {user?.nama?.charAt(0) || 'U'}
          </div>
          <div className="space-y-4 flex-1">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-neutral-500 mb-1">Nama Lengkap</p>
                <p className="font-semibold text-neutral-800 text-sm">{user?.nama}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 mb-1">Username</p>
                <p className="font-semibold text-neutral-800 text-sm">@{user?.username}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 mb-1">Role Akses</p>
                <p className="font-bold text-[#002444] text-sm">{user?.role}</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
      
      <Card title="Informasi Sistem">
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-[#c3c6cf]/30 text-xs">
            <span className="text-neutral-500">Versi Aplikasi</span>
            <span className="font-medium text-neutral-800">1.0.0</span>
          </div>
          <div className="flex justify-between py-2 border-b border-[#c3c6cf]/30 text-xs">
            <span className="text-neutral-500">Koneksi Backend</span>
            <span className="font-bold text-[#006c4e]">Terhubung</span>
          </div>
          <div className="flex justify-between py-2 border-b border-[#c3c6cf]/30 text-xs">
            <span className="text-neutral-500">Lisensi</span>
            <span className="font-medium text-neutral-800">Hak Milik Mak Tunik</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Pengaturan;
