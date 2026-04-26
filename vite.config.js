import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      // firebase-admin is a server-only SDK — never bundle it in the frontend
      external: [
        'firebase-admin',
        'firebase-admin/app',
        'firebase-admin/firestore',
        'firebase-admin/auth',
      ],
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/react-router-dom') || id.includes('node_modules/react-router/') || id.includes('node_modules/@remix-run/')) {
            return 'vendor-router';
          }
          if (id.includes('node_modules/firebase/')) {
            return 'vendor-firebase';
          }
          if (id.includes('node_modules/lucide-react/')) {
            return 'vendor-icons';
          }
          if (id.includes('node_modules/jspdf') || id.includes('node_modules/jspdf-autotable')) {
            return 'vendor-pdf';
          }
          if (id.includes('node_modules/html2canvas')) {
            return 'vendor-canvas';
          }
          if (id.includes('node_modules/react-select') || id.includes('node_modules/@emotion/')) {
            return 'vendor-select';
          }
        },
      },
    },
  },
})


