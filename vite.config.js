import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import lucidePreprocess from 'vite-plugin-lucide-preprocess'

import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  plugins: [
    react(),
    lucidePreprocess()
  ],
  server: {
    port: 3000,
    open: true
  },
  optimizeDeps: {
    exclude: ['node_modules_bad']
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    emptyOutDir: true,
    copyPublicDir: false,
    chunkSizeWarningLimit: 1000
  }
})
