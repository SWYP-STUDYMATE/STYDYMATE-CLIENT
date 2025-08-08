import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:8080',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
        '/workers': {
          target: env.VITE_WORKERS_API_URL || 'http://localhost:8787',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/workers/, ''),
        },
        '/login/oauth2/code/naver': {
          target: env.VITE_API_URL || 'http://localhost:8080',
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
    },
    build: {
      outDir: 'dist',
      sourcemap: mode !== 'production',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            ui: ['lucide-react', 'react-select', 'emoji-picker-react'],
            utils: ['axios', 'zustand', 'jwt-decode'],
            realtime: ['sockjs-client', 'stompjs']
          }
        }
      },
      chunkSizeWarningLimit: 1000
    }
  }
})
