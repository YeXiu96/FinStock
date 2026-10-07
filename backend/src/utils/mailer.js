// ============================================
// Mailer Utility — FinStocks
// ============================================
// Pengiriman email notifikasi, link reset, dan OTP password

const nodemailer = require('nodemailer');

/**
 * Buat transporter nodemailer berdasarkan environment variable
 */
const createTransporter = () => {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER ? process.env.SMTP_USER.trim() : '';
  const rawPass = process.env.SMTP_PASS ? process.env.SMTP_PASS.trim() : '';
  // Bersihkan komentar inline jika ada dan hilangkan spasi (format App Password Google)
  const pass = rawPass.split('#')[0].trim().replace(/\s+/g, '');

  if (!user || !pass) {
    return null; // Mode dev / fallback jika belum dikonfigurasi
  }

  // Khusus Gmail: gunakan service 'gmail' bawaan Nodemailer untuk keandalan maksimal
  if (host === 'smtp.gmail.com' || host === 'gmail' || user.endsWith('@gmail.com')) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user,
        pass,
      },
    });
  }

  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });
};

/**
 * Sensor email untuk tampilan publik (contoh: rad***@gmail.com)
 * @param {string} email
 * @returns {string}
 */
const maskEmail = (email) => {
  if (!email || !email.includes('@')) return email || '';
  const [name, domain] = email.split('@');
  if (name.length <= 3) {
    return `${name[0]}***@${domain}`;
  }
  const visiblePrefix = name.slice(0, 3);
  return `${visiblePrefix}***@${domain}`;
};

/**
 * Kirim email berisi link dan kode OTP reset password
 * @param {object} params
 * @param {string} params.to - Alamat email penerima
 * @param {string} params.name - Nama pengguna
 * @param {string} params.otp - Kode OTP 6 digit
 * @param {string} params.resetLink - URL tautan langsung ke halaman reset password
 */
const sendResetPasswordEmail = async ({ to, name, otp, resetLink }) => {
  const transporter = createTransporter();
  const senderEmail = (process.env.SMTP_USER || '').trim();
  const from = {
    name: 'FinStock UMKM',
    address: senderEmail || 'no-reply@finstocks.com',
  };

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px; }
        .card { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.06); }
        .header { background: #1a3a5c; color: #ffffff; padding: 32px 24px; text-align: center; }
        .brand-badge { display: inline-block; background: rgba(255,255,255,0.15); padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-bottom: 12px; color: #ffffff; }
        .header h1 { margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
        .header p { margin: 6px 0 0; font-size: 13px; color: #abc9f2; }
        .body { padding: 32px 24px; color: #334155; line-height: 1.6; }
        .btn-container { text-align: center; margin: 28px 0; }
        .btn-reset { display: inline-block; background-color: #1a3a5c; color: #ffffff !important; font-weight: 700; font-size: 15px; padding: 14px 32px; text-decoration: none; border-radius: 10px; box-shadow: 0 4px 12px rgba(26,58,92,0.25); }
        .otp-divider { text-align: center; margin: 24px 0 16px; position: relative; }
        .otp-divider::before { content: ""; position: absolute; left: 0; top: 50%; width: 100%; height: 1px; background: #e2e8f0; z-index: 1; }
        .otp-divider span { background: #ffffff; position: relative; z-index: 2; padding: 0 12px; font-size: 12px; color: #94a3b8; font-weight: 600; text-transform: uppercase; }
        .otp-box { background: #f8fafc; border: 2px dashed #93c5fd; border-radius: 10px; padding: 16px; text-align: center; margin: 12px 0 20px; }
        .otp-code { font-size: 28px; font-weight: 800; letter-spacing: 6px; color: #1a3a5c; font-family: monospace; }
        .info-text { font-size: 12px; color: #64748b; margin-top: 6px; }
        .link-alt { word-break: break-all; font-size: 11px; color: #2563eb; background: #eff6ff; padding: 10px; border-radius: 6px; margin-top: 8px; }
        .alert-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; font-size: 12px; color: #92400e; margin-top: 24px; border-radius: 4px; }
        .footer { background: #f8fafc; padding: 20px 24px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <div class="brand-badge">🍗 FinStock UMKM</div>
          <h1>Pemulihan Kata Sandi</h1>
          <p>Sistem Informasi Manajemen Keuangan & Persediaan</p>
        </div>
        <div class="body">
          <p>Halo <strong>${name}</strong>,</p>
          <p>Kami menerima permintaan untuk mereset kata sandi akun FinStock Anda. Silakan klik tombol di bawah ini untuk langsung menuju halaman pembaruan kata sandi:</p>
          
          <div class="btn-container">
            <a href="${resetLink}" class="btn-reset" target="_blank">Reset Password Sekarang</a>
          </div>

          <div class="otp-divider">
            <span>Atau Masukkan Kode Manual</span>
          </div>

          <div class="otp-box">
            <div class="otp-code">${otp}</div>
            <div class="info-text">Kode OTP dan tautan ini berlaku selama <strong>15 menit</strong>.</div>
          </div>

          <p style="font-size: 12px; color: #64748b; margin-bottom: 4px;">Jika tombol di atas tidak dapat diklik, buka tautan ini di browser Anda:</p>
          <div class="link-alt">${resetLink}</div>

          <div class="alert-box">
            <strong>Peringatan Keamanan:</strong> Jangan bagikan link atau kode OTP ini kepada siapa pun. Jika Anda tidak merasa meminta reset password, abaikan email ini dan akun Anda tetap aman.
          </div>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} FinStock UMKM Mak Tunik. Hak cipta dilindungi.
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `Halo ${name},\n\nPermintaan reset kata sandi akun FinStock Anda telah diterima.\n\nKlik tautan ini untuk mereset password:\n${resetLink}\n\nAtau gunakan kode OTP verifikasi: ${otp}\n\nTautan dan kode berlaku selama 15 menit.\nJangan bagikan kode ini kepada siapa pun.`;

  if (!transporter) {
    console.log('\n======================================================');
    console.log('📧 [EMAIL RESET PASSWORD]');
    console.log(`Kepada       : ${to} (${name})`);
    console.log(`Link Reset   : ${resetLink}`);
    console.log(`Kode OTP     : ${otp}`);
    console.log(`Catatan      : SMTP belum dikonfigurasi di .env.`);
    console.log(`Untuk mengaktifkan pengiriman email asli ke Gmail, isi SMTP_* di .env.`);
    console.log('======================================================\n');
    return { sent: false, mock: true, recipient: to, link: resetLink };
  }

  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject: `[FinStock] Link dan Kode Verifikasi Reset Password`,
      text: textContent,
      html: htmlContent,
    });
    console.log(`✅ Email reset password berhasil dikirim ke ${to} (Message ID: ${info.messageId})`);
    return { sent: true, mock: false, messageId: info.messageId, recipient: to, link: resetLink };
  } catch (error) {
    console.error(`❌ Gagal mengirim email ke ${to}:`, error.message);
    throw {
      status: 500,
      message: `Gagal mengirim email via Gmail: ${error.message}. Pastikan Sandi Aplikasi (App Password) di .env sudah benar.`,
      code: 'EMAIL_SEND_FAILED',
    };
  }
};

module.exports = {
  sendResetPasswordEmail,
  maskEmail,
};
