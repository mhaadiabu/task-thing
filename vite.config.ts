import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import path from 'path';

// https://vite.dev/config/
// Always make sure that '@tanstack/router-plugin' is passed before '@vitejs/plugin-react'
export default defineConfig({
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    tailwindcss(),
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api/auth': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/trpc': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
});
