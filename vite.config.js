import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))

const backendPort = process.env.VITE_BACKEND_PORT || '5000';
const backendHost = process.env.VITE_BACKEND_HOST || 'localhost';
const backendUrl = `http://${backendHost}:${backendPort}`;

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    env: {
      VITE_API_URL: 'http://localhost:5000/api/v1',
      VITE_WHATSAPP_NUMBER: '27791002552',
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split design-system primitives out of the main bundle so the
          // entry only ships application code. radix = all @radix-ui/*
          // packages (tabs, dialog, accordion, etc.), icons = lucide,
          // ui = helper libs (cva, clsx, tailwind-merge).
          radix: ['@radix-ui/react-tabs', '@radix-ui/react-dialog', '@radix-ui/react-accordion', '@radix-ui/react-select', '@radix-ui/react-label', '@radix-ui/react-progress', '@radix-ui/react-separator', '@radix-ui/react-slot'],
          icons: ['lucide-react'],
          ui: ['class-variance-authority', 'clsx', 'tailwind-merge'],
          vendor: ['react', 'react-dom', 'react-router-dom'],
          recharts: ['recharts'],
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: backendUrl,
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: backendUrl,
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
