// ============================================
// Entry Point React — FinStocks
// ============================================

import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster, useToasterStore, toast } from 'react-hot-toast'
import App from './App.jsx'
import './index.css'

// Komponen pembatas jumlah toast aktif untuk mencegah penumpukan toast saat spam klik
function ToastLimiter({ limit = 3 }) {
  const { toasts } = useToasterStore()

  React.useEffect(() => {
    toasts
      .filter((t) => t.visible)
      .filter((_, i) => i >= limit)
      .forEach((t) => toast.dismiss(t.id))
  }, [toasts, limit])

  return null
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      {/* Batasi maksimal 3 toast bersamaan */}
      <ToastLimiter limit={3} />
      {/* Notifikasi toast global */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#0f172a',
            color: '#f8fafc',
            borderRadius: '8px',
            fontSize: '14px',
          },
          success: {
            iconTheme: {
              primary: '#16a34a',
              secondary: '#f8fafc',
            },
          },
          error: {
            iconTheme: {
              primary: '#dc2626',
              secondary: '#f8fafc',
            },
          },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>,
)
