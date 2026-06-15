import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Lock, User } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import useAuthStore from '../store/useAuthStore';
import axiosInstance from '../api/axiosInstance';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { setAuth, isAuthenticated } = useAuthStore();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast.error('Username dan password wajib diisi');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axiosInstance.post('/auth/login', {
        username,
        password
      });

      const { token, user } = response.data.data;
      
      // Save to global state
      setAuth(token, user);
      
      toast.success('Login berhasil!');
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Login error:', error);
      const message = error.response?.data?.message || 'Terjadi kesalahan saat login';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex flex-col md:flex-row font-sans bg-white select-none">
      
      {/* Left Panel: Deep Corporate branding (hidden on mobile) */}
      <div className="hidden md:flex flex-col w-[390px] bg-[#1a3a5c] text-white p-10 shrink-0 min-h-screen relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-[#002444] rounded-full opacity-60 blur-3xl"></div>
        <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-[#006c4e] rounded-full opacity-35 blur-2xl"></div>

        <div className="relative z-10 flex flex-col h-full justify-between">
          {/* Brand header */}
          <div>
            <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-[#1a3a5c] rounded-sm"></div>
              </div>
              <span className="text-xl font-bold tracking-tight">FinStock UMKM</span>
            </div>

            {/* Corporate Title disclosures */}
            <div className="space-y-6">
              <h1 className="text-2xl font-bold leading-tight">
                Sistem Keuangan &amp; Persediaan POS UMKM
              </h1>
              <p className="text-xs text-[#abc9f2] leading-relaxed">
                Platform terpadu untuk pencatatan transaksi harian dan manajemen stok bahan baku secara real-time.
              </p>
            </div>

            {/* Feature lists staggered checklist */}
            <div className="mt-10 space-y-4">
              <div className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-[#83f5c6] mt-1.5 shrink-0"></span>
                <span className="text-xs text-[#abc9f2]/90">Dashboard analitik penjualan &amp; pengeluaran.</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-[#83f5c6] mt-1.5 shrink-0"></span>
                <span className="text-xs text-[#abc9f2]/90">Pencatatan kasir instan ber-struk thermal PDF.</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-[#83f5c6] mt-1.5 shrink-0"></span>
                <span className="text-xs text-[#abc9f2]/90">Pengendalian stok bahan baku otomatis.</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-[#83f5c6] mt-1.5 shrink-0"></span>
                <span className="text-xs text-[#abc9f2]/90">Manajemen vendor dan kemitraan bahan baku.</span>
              </div>
            </div>
          </div>

          {/* Corporate bottom credit footer */}
          <div className="pt-6 border-t border-[#002444]">
            <p className="text-[9px] uppercase tracking-wider text-[#abc9f2]/70 font-semibold">
              Powered by FinStock Enterprise
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel: White login form */}
      <div className="flex-1 bg-[#f8f9fb] flex items-center justify-center p-6 md:p-12 relative">
        <div className="w-full max-w-[400px] flex flex-col">
          
          {/* Mobile responsive logo header */}
          <div className="flex md:hidden items-center justify-center gap-3 mb-8">
            <div className="w-8 h-8 bg-white border border-[#c3c6cf] rounded-lg flex items-center justify-center shrink-0">
              <div className="w-4 h-4 border-2 border-[#1a3a5c] rounded-sm"></div>
            </div>
            <span className="text-lg font-bold text-[#002444]">FinStock UMKM</span>
          </div>

          {/* White Card Container */}
          <div className="bg-white p-8 rounded-xl border border-[#c3c6cf]/30 shadow-sm">
            
            {/* Context title */}
            <h2 className="text-lg font-bold text-[#191c1e] mb-6 text-center md:text-left">
              Masuk ke Akun Anda
            </h2>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Username field */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-[#191c1e] uppercase tracking-wide">Username</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#73777f]">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    disabled={isLoading}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Masukkan username Anda..."
                    className="w-full text-xs h-10 pl-9 pr-4 bg-white border border-[#c3c6cf] rounded-lg focus:border-[#1a3a5c] focus:ring-1 focus:ring-[#1a3a5c] outline-none transition-all placeholder-[#73777f]/50"
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wide">
                  <label className="text-[#191c1e]">Password</label>
                </div>
                
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#73777f]">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    required
                    disabled={isLoading}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan password Anda..."
                    className="w-full text-xs h-10 pl-9 pr-4 bg-white border border-[#c3c6cf] rounded-lg focus:border-[#1a3a5c] focus:ring-1 focus:ring-[#1a3a5c] outline-none transition-all placeholder-[#73777f]/50"
                  />
                </div>
              </div>

              {/* Action Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-4 rounded-lg text-xs font-bold text-white transition-all duration-300 flex items-center justify-center gap-2 shadow-sm bg-[#1a3a5c] hover:bg-[#002444] disabled:opacity-50 cursor-pointer"
              >
                <span>{isLoading ? 'Sedang Masuk...' : 'Masuk ke Sistem'}</span>
              </button>
            </form>
          </div>

          {/* Footer note advisory */}
          <div className="mt-6 flex items-center justify-center gap-1.5 text-[10px] text-[#73777f] font-semibold">
            <span>Hanya untuk operasional internal sistem keuangan.</span>
          </div>

        </div>
      </div>

    </div>
  );
};

export default Login;
