import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: { port: 5173, host: '0.0.0.0' },
  preview: { port: 4173, host: '0.0.0.0' },
  build: {
    target: 'es2021',
    sourcemap: false,
    cssCodeSplit: true,
    chunkSizeWarningLimit: 1200,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/messaging', 'firebase/analytics'],
          motion: ['framer-motion'],
          ui: ['lucide-react'],
        },
      },
    },
  },
  define: {
    __APP_VERSION__: JSON.stringify('1.0.0'),
  },
});
