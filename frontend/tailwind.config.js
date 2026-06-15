/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Palet warna FinStocks sesuai Vibe Coding Document
      colors: {
        primary: {
          50: '#f0f4f8',
          100: '#d9e2ec',
          200: '#bcccdc',
          300: '#9fb3c8',
          400: '#829ab1',
          500: '#1a3a5c',   // Corporate light navy
          600: '#002444',   // Corporate dark navy
          700: '#0a1d30',
          800: '#050f1a',
          900: '#02070d',
        },
        navy: {
          dark: '#002444',
          light: '#1a3a5c',
        },
        greyBlue: '#c3c6cf',
        cashier: {
          green: '#006c4e',
          mint: '#83f5c6',
        },
        warningRed: {
          dark: '#ba1a1a',
          light: '#ffdad6',
        },
        success: '#16a34a',
        warning: '#d97706',
        danger: '#dc2626',
        neutral: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
      },
      // Font family default
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
