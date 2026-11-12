import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// O proxy evita CORS em desenvolvimento: o navegador fala com o Vite (5173)
// e o Vite repassa /api para o NestJS (3000).
const alvoApi = process.env.VITE_API_URL ?? 'http://localhost:3000';

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    proxy: {
      '/api': { target: alvoApi, changeOrigin: true },
    },
  },
});

