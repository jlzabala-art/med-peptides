import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import lucidePreprocess from 'vite-plugin-lucide-preprocess';

import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  plugins: [react(), lucidePreprocess()],
  server: {
    port: 3000,
    open: true,
  },
  optimizeDeps: {
    exclude: ['node_modules_bad'],
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    emptyOutDir: true,
    copyPublicDir: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react')) return 'vendor-react';
            if (id.includes('firebase')) return 'vendor-firebase';
            if (id.includes('framer-motion')) return 'vendor-motion';
            if (id.includes('lucide-react')) return 'vendor-lucide';
            if (id.includes('recharts')) return 'vendor-recharts';
            return 'vendor';
          }
          // Portal-specific chunks to prevent B2C users from downloading admin/B2B code
          if (
            id.includes('/src/components/admin/') ||
            id.includes('/src/routes/AdminRoutes') ||
            id.includes('/src/templates/Admin')
          ) {
            return 'portal-admin';
          }
          if (id.includes('/src/routes/DoctorRoutes') || id.includes('/src/templates/Doctor')) {
            return 'portal-doctor';
          }
          if (
            id.includes('/src/routes/SupplierRoutes') ||
            id.includes('/src/templates/Supplier') ||
            id.includes('/src/components/b2b/')
          ) {
            return 'portal-supplier';
          }
          if (
            id.includes('/src/routes/WholesalerRoutes') ||
            id.includes('/src/templates/Wholesaler')
          ) {
            return 'portal-wholesaler';
          }
          if (id.includes('/src/routes/ClinicRoutes') || id.includes('/src/templates/Clinic')) {
            return 'portal-clinic';
          }
          if (id.includes('/src/routes/PharmacyRoutes') || id.includes('/src/templates/Pharmacy')) {
            return 'portal-pharmacy';
          }
        },
      },
    },
  },
});
