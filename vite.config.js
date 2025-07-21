import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    proxy: {
      '/login/naver': 'http://localhost:8080',
      '/login/tokens': 'http://localhost:8080',
      '/login/oauth2': 'http://localhost:8080', 
      // 필요시 '/api': 'http://localhost:8080' 등 추가 가능
    },
    historyApiFallback: true,
  },
})
