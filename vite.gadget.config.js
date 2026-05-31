import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.NODE_ENV': '"production"',
  },
  build: {
    outDir: 'dist/gadget',
    lib: {
      entry: resolve(__dirname, 'src/gadgets/index.jsx'),
      name: 'AiImporterGadget',
      formats: ['iife'],
      fileName: () => 'ai-importer-gadget.min.js'
    },
    rollupOptions: {
      // We don't externalize React because we want this gadget to be fully self-contained and drop-in for ANY portal.
      output: {
        extend: true
      }
    }
  }
});
