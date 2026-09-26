import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import 'dotenv/config';

// https://vite.dev/config/
// Always make sure that '@tanstack/router-plugin' is passed before '@vitejs/plugin-react'
export default defineConfig({
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    tailwindcss(),
    react(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api/auth': {
        target: process.env.BETTER_AUTH_URL,
        changeOrigin: true,
      },
      '/trpc': {
        target: process.env.BETTER_AUTH_URL,
        changeOrigin: true,
      },
    },
  },
});
