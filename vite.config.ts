import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  // Dev server — aceita conexões de qualquer dispositivo na rede local
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
  },

  // Preview server (build de produção) — mesma exposição de rede
  preview: {
    host: '0.0.0.0',
    port: 4173,
    strictPort: true,
  },
})
