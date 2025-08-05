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
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/login/oauth2/code/naver': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
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
