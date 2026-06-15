// ============================================
// Entry Point React — FinStocks
// ============================================

import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
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
