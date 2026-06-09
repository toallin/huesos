import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import vitePluginString from 'vite-plugin-string'; // <-- 1. Importa el plugin

export default defineConfig({
  plugins: [
    react(),
    vitePluginString({
      include: '**/*.csv' // <-- 2. Configura para que lea archivos .csv
    })
  ]
});