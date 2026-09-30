import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ArrowLeft, KeyRound, Lock, ShieldCheck, User } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';

const inputClassName = 'w-full text-xs h-10 pl-9 pr-4 bg-white border border-[#c3c6cf] rounded-lg focus:border-[#1a3a5c] focus:ring-1 focus:ring-[#1a3a5c] outline-none transition-all placeholder-[#73777f]/50';

const ForgotPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [username, setUsername] = useState(location.state?.username || '');
  const [oldPassword, setOldPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpHint, setOtpHint] = useState('');

  const handleRequestOtp = async (event) => {
    event.preventDefault();

    if (!username || !oldPassword) {
      toast.error('Username dan password lama wajib diisi');
      return;
    }

    if (oldPassword.length < 6) {
      toast.error('Password lama minimal 6 karakter');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axiosInstance.post('/auth/forgot-password/request', {
        username,
        currentPassword: oldPassword,
      });

      const otpCode = response.data?.data?.otp;
      setOtpSent(true);
      setOtpHint(`Kode OTP: ${otpCode}. Masukkan kode ini untuk verifikasi.`);
      toast.success(response.data?.data?.message || 'Kode OTP berhasil dibuat', { duration: 8000 });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Terjadi kesalahan saat meminta OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyPasswordReset = async (event) => {
    event.preventDefault();

    if (!otp || !newPassword || !confirmPassword) {
      toast.error('OTP dan seluruh data password wajib diisi');
      return;
    }

    if (otp.length !== 6) {
      toast.error('OTP harus 6 digit');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password baru minimal 6 karakter');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Konfirmasi password baru tidak cocok');
      return;
    }

    setIsLoading(true);
    try {
      await axiosInstance.post('/auth/forgot-password/verify', {
        username,
        otp,
        newPassword,
      });

      toast.success('Password berhasil diubah. Silakan login kembali.');
      navigate('/login', { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Terjadi kesalahan saat mengubah password');
    } finally {
      setIsLoading(false);
    }
  };

  const renderField = (label, icon, input) => (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-bold uppercase tracking-wide text-[#191c1e]">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#73777f]">{icon}</span>
        {input}
      </div>
    </div>
  );

  return (
    <main className="min-h-screen w-screen flex flex-col md:flex-row font-sans bg-white">
      <aside className="hidden md:flex flex-col justify-between w-[390px] bg-[#1a3a5c] text-white p-10 shrink-0 min-h-screen relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-[#002444] rounded-full opacity-60 blur-3xl" />
        <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-[#006c4e] rounded-full opacity-35 blur-2xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-[#1a3a5c] rounded-sm" />
            </div>
            <span className="text-xl font-bold">FinStock UMKM</span>
          </div>
          <h1 className="text-2xl font-bold leading-tight">Pemulihan akses akun</h1>
          <p className="mt-4 text-xs text-[#abc9f2] leading-relaxed">
            Verifikasi akun Anda dan buat password baru untuk kembali menggunakan FinStock.
          </p>
        </div>
        <p className="relative z-10 pt-6 border-t border-[#002444] text-[9px] uppercase tracking-wider text-[#abc9f2]/70 font-semibold">
          Powered by FinStock Enterprise
        </p>
      </aside>

      <section className="flex-1 bg-[#f8f9fb] flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-[420px]">
          <div className="flex md:hidden items-center justify-center gap-3 mb-8">
            <div className="w-8 h-8 bg-white border border-[#c3c6cf] rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-[#1a3a5c] rounded-sm" />
            </div>
            <span className="text-lg font-bold text-[#002444]">FinStock UMKM</span>
          </div>

          <div className="bg-white p-8 rounded-xl border border-[#c3c6cf]/30 shadow-sm">
            <Link to="/login" className="inline-flex items-center gap-2 text-xs font-semibold text-[#1a3a5c] hover:underline mb-6">
              <ArrowLeft className="w-4 h-4" /> Kembali ke login
            </Link>
            <h2 className="text-lg font-bold text-[#191c1e]">Lupa Password</h2>
            <p className="text-xs text-[#73777f] mt-2 mb-6">
              {otpSent ? 'Masukkan OTP dan tentukan password baru.' : 'Masukkan akun dan password lama untuk memulai verifikasi.'}
            </p>

            {otpSent && (
              <div className="rounded-lg border border-[#c3c6cf] bg-[#f7f9fc] p-3 text-[11px] text-[#1a3a5c] mb-4">
                <div className="flex items-center gap-2 font-semibold mb-1">
                  <ShieldCheck className="w-4 h-4" /> Kode verifikasi
                </div>
                <p>{otpHint}</p>
              </div>
            )}

            <form onSubmit={otpSent ? handleVerifyPasswordReset : handleRequestOtp} className="space-y-4">
              {renderField('Username', <User className="w-4 h-4" />, (
                <input type="text" value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Masukkan username akun" disabled={otpSent} className={inputClassName} />
              ))}

              {!otpSent ? renderField('Password Lama', <Lock className="w-4 h-4" />, (
                <input type="password" value={oldPassword} onChange={(event) => setOldPassword(event.target.value)} placeholder="Masukkan password lama" className={inputClassName} />
              )) : (
                <>
                  {renderField('Kode OTP', <ShieldCheck className="w-4 h-4" />, (
                    <input type="text" inputMode="numeric" autoComplete="one-time-code" value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="Masukkan 6 digit OTP" className={inputClassName} />
                  ))}
                  {renderField('Password Baru', <KeyRound className="w-4 h-4" />, (
                    <input type="password" autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} placeholder="Minimal 6 karakter" className={inputClassName} />
                  ))}
                  {renderField('Konfirmasi Password Baru', <KeyRound className="w-4 h-4" />, (
                    <input type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Ulangi password baru" className={inputClassName} />
                  ))}
                </>
              )}

              <button type="submit" disabled={isLoading} className="w-full mt-2 py-3 px-4 rounded-lg text-xs font-bold text-white transition-all flex items-center justify-center gap-2 bg-[#1a3a5c] hover:bg-[#002444] disabled:opacity-50 cursor-pointer">
                {otpSent ? <KeyRound className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                <span>{isLoading ? 'Memproses...' : otpSent ? 'Ubah Password' : 'Kirim Kode OTP'}</span>
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
};

export default ForgotPassword;