import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// El backend Spring Boot corre en http://localhost:8081.
// Redirigimos /api hacia él para llamar rutas relativas (/api/v1/...) sin CORS.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },
    },
  },
})
