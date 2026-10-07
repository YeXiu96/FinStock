import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ArrowLeft, CheckCircle2, Eye, EyeOff, KeyRound, Lock, ShieldCheck } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';

const inputClassName =
  'w-full text-xs h-10 pl-9 pr-10 bg-white border border-[#c3c6cf] rounded-lg focus:border-[#1a3a5c] focus:ring-1 focus:ring-[#1a3a5c] outline-none transition-all placeholder-[#73777f]/50';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const usernameParam = searchParams.get('username') || '';
  const tokenParam = searchParams.get('token') || '';
  const otpParam = searchParams.get('otp') || '';

  const [username, setUsername] = useState(usernameParam);
  const [token] = useState(tokenParam);
  const [otp, setOtp] = useState(otpParam);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleResetPassword = async (event) => {
    event.preventDefault();

    if (!newPassword || !confirmPassword) {
      toast.error('Seluruh kolom password wajib diisi');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password baru minimal 6 karakter');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Konfirmasi password tidak cocok');
      return;
    }

    if (!token && !otp) {
      toast.error('Tautan atau kode OTP verifikasi tidak valid. Silakan ajukan ulang melalui menu Lupa Password.');
      return;
    }

    setIsLoading(true);
    try {
      await axiosInstance.post('/auth/forgot-password/verify', {
        username: username.trim(),
        token: token || undefined,
        otp: otp ? otp.trim() : undefined,
        newPassword,
      });

      setIsSuccess(true);
      toast.success('Password berhasil diperbarui!');
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Gagal memperbarui password. Tautan mungkin telah kedaluwarsa.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-screen flex flex-col md:flex-row font-sans bg-white">
      {/* Kolom Kiri Branding */}
      <aside className="hidden md:flex flex-col justify-between w-[390px] bg-[#1a3a5c] text-white p-10 shrink-0 min-h-screen relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-[#002444] rounded-full opacity-60 blur-3xl" />
        <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-[#006c4e] rounded-full opacity-35 blur-2xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow">
              <span className="text-xl">🍗</span>
            </div>
            <span className="text-xl font-bold tracking-tight">FinStock UMKM</span>
          </div>

          <h1 className="text-2xl font-bold leading-tight">Buat Kata Sandi Baru</h1>
          <p className="mt-4 text-xs text-[#abc9f2] leading-relaxed">
            Anda berhasil mengakses tautan verifikasi dari email. Silakan tentukan kata sandi baru untuk akun Anda.
          </p>

          <div className="mt-8 p-4 bg-white/10 rounded-xl border border-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-xs font-semibold text-white mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Tautan Terverifikasi
            </div>
            <p className="text-[11px] text-[#abc9f2]/90 leading-normal">
              Pastikan kata sandi baru Anda unik, kuat, dan mudah diingat.
            </p>
          </div>
        </div>

        <p className="relative z-10 pt-6 border-t border-white/10 text-[9px] uppercase tracking-wider text-[#abc9f2]/70 font-semibold">
          Powered by FinStock Enterprise
        </p>
      </aside>

      {/* Kolom Kanan Form */}
      <section className="flex-1 bg-[#f8f9fb] flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-[440px]">
          {/* Logo Mobile */}
          <div className="flex md:hidden items-center justify-center gap-3 mb-8">
            <div className="w-9 h-9 bg-[#1a3a5c] text-white rounded-lg flex items-center justify-center">
              <span>🍗</span>
            </div>
            <span className="text-lg font-bold text-[#002444]">FinStock UMKM</span>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-[#c3c6cf]/40 shadow-sm">
            {isSuccess ? (
              <div className="text-center py-4 space-y-4">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-[#191c1e]">Password Berhasil Diubah!</h2>
                <p className="text-xs text-[#73777f] max-w-sm mx-auto">
                  Kata sandi akun Anda telah berhasil diperbarui. Silakan gunakan password baru ini untuk masuk ke sistem FinStock.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => navigate('/login', { replace: true })}
                    className="w-full py-3 px-4 rounded-lg text-xs font-bold text-white bg-[#1a3a5c] hover:bg-[#002444] transition-all cursor-pointer shadow-sm"
                  >
                    Masuk Sekarang (Login)
                  </button>
                </div>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-[#1a3a5c] hover:underline mb-6"
                >
                  <ArrowLeft className="w-4 h-4" /> Kembali ke Login
                </Link>

                <h2 className="text-xl font-bold text-[#191c1e]">Reset Password</h2>
                <p className="text-xs text-[#73777f] mt-1.5 mb-6">
                  {username ? (
                    <>
                      Mengatur ulang kata sandi untuk akun <strong className="text-[#1a3a5c]">{username}</strong>.
                    </>
                  ) : (
                    'Silakan masukkan kata sandi baru untuk akun Anda.'
                  )}
                </p>

                <form onSubmit={handleResetPassword} className="space-y-4">
                  {/* Jika dibuka tanpa username atau tanpa token otomatis */}
                  {!usernameParam && (
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold uppercase tracking-wide text-[#191c1e]">
                        Username Akun
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#73777f]">
                          <Lock className="w-4 h-4" />
                        </span>
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="Masukkan username Anda"
                          required
                          className={inputClassName}
                        />
                      </div>
                    </div>
                  )}

                  {!tokenParam && (
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold uppercase tracking-wide text-[#191c1e]">
                        Kode OTP dari Gmail
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#73777f]">
                          <ShieldCheck className="w-4 h-4" />
                        </span>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="6 digit angka dari email"
                          maxLength={6}
                          required
                          className={`${inputClassName} tracking-widest font-mono text-sm`}
                        />
                      </div>
                    </div>
                  )}

                  {/* Input Password Baru */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-wide text-[#191c1e]">
                      Password Baru
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#73777f]">
                        <KeyRound className="w-4 h-4" />
                      </span>
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Minimal 6 karakter"
                        required
                        className={inputClassName}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#73777f] hover:text-[#191c1e]"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Input Konfirmasi Password Baru */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-wide text-[#191c1e]">
                      Konfirmasi Password Baru
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#73777f]">
                        <KeyRound className="w-4 h-4" />
                      </span>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Ulangi password baru"
                        required
                        className={inputClassName}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#73777f] hover:text-[#191c1e]"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Tombol Simpan */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-4 py-3 px-4 rounded-lg text-xs font-bold text-white bg-[#1a3a5c] hover:bg-[#002444] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-sm"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>{isLoading ? 'Menyimpan Password...' : 'Simpan Password Baru'}</span>
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
};

export default ResetPassword;
