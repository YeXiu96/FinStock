import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  RefreshCw,
  ShieldCheck,
  User,
} from 'lucide-react';
import axiosInstance from '../api/axiosInstance';

const inputClassName =
  'w-full text-xs h-10 pl-9 pr-10 bg-white border border-[#c3c6cf] rounded-lg focus:border-[#1a3a5c] focus:ring-1 focus:ring-[#1a3a5c] outline-none transition-all placeholder-[#73777f]/50';

const ForgotPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState(location.state?.username || '');
  const [oldPassword, setOldPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [targetEmail, setTargetEmail] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [showManualOtp, setShowManualOtp] = useState(false);

  // Timer cooldown kirim ulang
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleRequestOtp = async (event) => {
    if (event) event.preventDefault();

    if (!identifier.trim()) {
      toast.error('Username atau email wajib diisi');
      return;
    }

    if (oldPassword && oldPassword.length < 6) {
      toast.error('Password lama minimal 6 karakter');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axiosInstance.post('/auth/forgot-password/request', {
        username: identifier.trim(),
        currentPassword: oldPassword || undefined,
      });

      const data = response.data?.data;
      setOtpSent(true);
      setTargetEmail(data?.email || data?.maskedEmail || '');
      setResendCooldown(60);

      toast.success(
        data?.message || 'Tautan dan kode reset telah dikirim ke email Gmail Anda',
        { duration: 6000 }
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Terjadi kesalahan saat memproses permintaan reset password'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyPasswordReset = async (event) => {
    event.preventDefault();

    if (!otp || !newPassword || !confirmPassword) {
      toast.error('Kode OTP dan seluruh data password wajib diisi');
      return;
    }

    if (otp.length !== 6) {
      toast.error('Kode OTP harus 6 digit');
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
        username: identifier.trim(),
        otp: otp.trim(),
        newPassword,
      });

      toast.success('Password berhasil diperbarui! Silakan login kembali.');
      navigate('/login', { replace: true });
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Terjadi kesalahan saat memverifikasi kode'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderField = (label, icon, input, helper = null) => (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-bold uppercase tracking-wide text-[#191c1e]">
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#73777f]">
          {icon}
        </span>
        {input}
      </div>
      {helper && <p className="text-[10px] text-[#73777f] mt-0.5">{helper}</p>}
    </div>
  );

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

          <h1 className="text-2xl font-bold leading-tight">Pemulihan Akses Akun</h1>
          <p className="mt-4 text-xs text-[#abc9f2] leading-relaxed">
            Permintaan reset password akan dikirim langsung ke Gmail Anda yang terdaftar demi keamanan data bisnis Anda.
          </p>

          <div className="mt-8 p-4 bg-white/10 rounded-xl border border-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-xs font-semibold text-white mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Keamanan Terverifikasi
            </div>
            <p className="text-[11px] text-[#abc9f2]/90 leading-normal">
              Buka aplikasi Gmail Anda untuk mengakses link tombol "Reset Password Sekarang".
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
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#1a3a5c] hover:underline mb-6"
            >
              <ArrowLeft className="w-4 h-4" /> Kembali ke Login
            </Link>

            {!otpSent ? (
              <>
                <h2 className="text-xl font-bold text-[#191c1e]">Lupa Password</h2>
                <p className="text-xs text-[#73777f] mt-1.5 mb-6">
                  Masukkan username atau email terdaftar Anda. Tautan pemulihan kata sandi akan dikirim ke Gmail Anda.
                </p>

                <form onSubmit={handleRequestOtp} className="space-y-4">
                  {renderField(
                    'Username atau Email',
                    identifier.includes('@') ? <Mail className="w-4 h-4" /> : <User className="w-4 h-4" />,
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="Contoh: owner atau radityaamanta123@gmail.com"
                      className={inputClassName}
                    />
                  )}

                  {renderField(
                    'Password Lama (Opsional)',
                    <Lock className="w-4 h-4" />,
                    <input
                      type="password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      placeholder="Masukkan jika masih ingat"
                      className={inputClassName}
                    />,
                    'Bisa dikosongkan jika Anda benar-benar lupa password lama Anda.'
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-2 py-3 px-4 rounded-lg text-xs font-bold text-white transition-all flex items-center justify-center gap-2 bg-[#1a3a5c] hover:bg-[#002444] disabled:opacity-50 cursor-pointer shadow-sm"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Mengirim ke Gmail...</span>
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4" />
                        <span>Kirim Link Reset ke Gmail</span>
                      </>
                    )}
                  </button>
                </form>
              </>
            ) : (
              /* State Ketika Email Sudah Dikirim */
              <div className="space-y-5">
                <div className="text-center">
                  <div className="w-14 h-14 bg-blue-50 text-[#1a3a5c] rounded-2xl flex items-center justify-center mx-auto mb-3 border border-blue-100 shadow-sm">
                    <Mail className="w-7 h-7" />
                  </div>
                  <h2 className="text-xl font-bold text-[#191c1e]">Email Terkirim ke Gmail!</h2>
                  <p className="text-xs text-[#525866] mt-1.5 leading-relaxed">
                    Kami telah mengirimkan tautan reset kata sandi ke:
                  </p>
                  <p className="text-xs font-bold text-[#1a3a5c] bg-blue-50/80 py-1.5 px-3 rounded-md inline-block mt-2 border border-blue-200">
                    {targetEmail}
                  </p>
                </div>

                <div className="bg-[#f8f9fb] p-4 rounded-xl border border-[#e2e8f0] text-xs text-[#334155] space-y-2.5">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <p className="text-[11px] leading-relaxed">
                      Buka aplikasi <strong>Gmail</strong> di HP atau web browser Anda.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <p className="text-[11px] leading-relaxed">
                      Cari email dari <strong>FinStock UMKM</strong>, lalu klik tombol <strong>"Reset Password Sekarang"</strong>.
                    </p>
                  </div>
                </div>

                {/* Tombol buka Gmail */}
                <a
                  href="https://mail.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-lg text-xs font-bold text-white bg-[#1a3a5c] hover:bg-[#002444] transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Buka Gmail di Browser</span>
                </a>

                {/* Accordion untuk input manual kode OTP jika diinginkan */}
                <div className="pt-2 border-t border-neutral-100">
                  <button
                    type="button"
                    onClick={() => setShowManualOtp(!showManualOtp)}
                    className="text-[11px] font-semibold text-[#1a3a5c] hover:underline flex items-center justify-between w-full"
                  >
                    <span>{showManualOtp ? '▲ Tutup input kode manual' : '▼ Atau masukkan kode OTP dari Gmail secara manual'}</span>
                  </button>

                  {showManualOtp && (
                    <form onSubmit={handleVerifyPasswordReset} className="mt-3 space-y-3 pt-2">
                      {renderField(
                        'Kode OTP 6-Digit (dari Gmail)',
                        <ShieldCheck className="w-4 h-4" />,
                        <input
                          type="text"
                          inputMode="numeric"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="Masukkan 6 digit angka dari email"
                          maxLength={6}
                          className={`${inputClassName} tracking-widest font-mono text-sm`}
                        />
                      )}

                      {renderField(
                        'Password Baru',
                        <KeyRound className="w-4 h-4" />,
                        <div className="relative">
                          <input
                            type={showNewPassword ? 'text' : 'password'}
                            autoComplete="new-password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Minimal 6 karakter"
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
                      )}

                      {renderField(
                        'Konfirmasi Password Baru',
                        <KeyRound className="w-4 h-4" />,
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            autoComplete="new-password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Ulangi password baru"
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
                      )}

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-2.5 px-4 rounded-lg text-xs font-bold text-white bg-[#006c4e] hover:bg-[#004e38] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                      >
                        <KeyRound className="w-4 h-4" />
                        <span>{isLoading ? 'Menyimpan...' : 'Perbarui Password'}</span>
                      </button>
                    </form>
                  )}
                </div>

                {/* Actions navigasi */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setOtpSent(false);
                      setOtp('');
                    }}
                    className="text-[#73777f] hover:text-[#1a3a5c] hover:underline cursor-pointer"
                  >
                    Ubah akun / email
                  </button>

                  <button
                    type="button"
                    disabled={resendCooldown > 0 || isLoading}
                    onClick={() => handleRequestOtp()}
                    className="inline-flex items-center gap-1 font-semibold text-[#1a3a5c] hover:underline disabled:text-gray-400 disabled:no-underline cursor-pointer disabled:cursor-not-allowed"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                    {resendCooldown > 0 ? `Kirim ulang (${resendCooldown}s)` : 'Kirim ulang email'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
};

export default ForgotPassword;