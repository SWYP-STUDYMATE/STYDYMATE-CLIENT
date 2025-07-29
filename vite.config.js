import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    proxy: {
      // '/login/naver': 'http://localhost:8080',
    },
    historyApiFallback: true,
  },
  define: {
    global: 'window'
  },
  optimizeDeps: {
    include: ['sockjs-client', 'stompjs']
  }
})
