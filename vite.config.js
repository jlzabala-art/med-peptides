import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  plugins: [
    react(),
  ],
  server: {
    port: 3000,
    open: true,
    hmr: {
      overlay: false,
    },
  },
  optimizeDeps: {
    exclude: ['node_modules_bad'],
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    emptyOutDir: true,
    copyPublicDir: true,
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
      },
      output: {
        manualChunks(id) {
          // Heavy vendor libs — split to prevent build hang
          if (id.includes('node_modules/lucide-react')) return 'vendor-lucide';
          if (id.includes('node_modules/firebase')) return 'vendor-firebase';
          if (id.includes('node_modules/react-dom')) return 'vendor-react';
          if (id.includes('node_modules/react-router')) return 'vendor-router';
          // Portal-specific chunks
          if (id.includes('/src/routes/DoctorRoutes') || id.includes('/src/templates/Doctor'))
            return 'portal-doctor';
          if (
            id.includes('/src/routes/SupplierRoutes') ||
            id.includes('/src/templates/Supplier') ||
            id.includes('/src/components/b2b/')
          )
            return 'portal-supplier';
          if (
            id.includes('/src/routes/WholesalerRoutes') ||
            id.includes('/src/templates/Wholesaler')
          )
            return 'portal-wholesaler';
          if (id.includes('/src/routes/ClinicRoutes') || id.includes('/src/templates/Clinic'))
            return 'portal-clinic';
          if (id.includes('/src/routes/PharmacyRoutes') || id.includes('/src/templates/Pharmacy'))
            return 'portal-pharmacy';
        },
      },
    },
  },
});
