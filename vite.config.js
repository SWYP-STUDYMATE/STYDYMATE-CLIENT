import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [
      react(),
      tailwindcss()
    ],
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
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: mode === 'production',
          drop_debugger: mode === 'production'
        }
      },
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            // node_modules 기반 청킹
            if (id.includes('node_modules')) {
              if (id.includes('react-router') || id.includes('react-dom')) {
                return 'react-vendor';
              }
              if (id.includes('lucide-react') || id.includes('react-select') || id.includes('emoji-picker-react')) {
                return 'ui-vendor';
              }
              if (id.includes('axios') || id.includes('zustand') || id.includes('jwt-decode')) {
                return 'utils-vendor';
              }
              if (id.includes('sockjs') || id.includes('stomp')) {
                return 'realtime-vendor';
              }
              return 'vendor';
            }
          },
          // 청크 파일명 최적화
          chunkFileNames: (chunkInfo) => {
            const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop() : 'chunk';
            return `js/[name]-${facadeModuleId}-[hash].js`;
          },
          assetFileNames: 'assets/[name]-[hash][extname]'
        }
      },
      // 압축 및 트리쉐이킹 최적화
      cssCodeSplit: true,
      chunkSizeWarningLimit: 1000,
      // Preload 지시어 삽입
      modulePreload: {
        polyfill: true
      }
    }
  }
})
