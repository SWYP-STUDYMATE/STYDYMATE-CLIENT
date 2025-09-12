import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { visualizer } from 'rollup-plugin-visualizer'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const isProduction = mode === 'production'
  
  return {
    plugins: [
      react(),
      tailwindcss(),
      // 번들 분석 플러그인 (환경변수로 제어)
      process.env.ANALYZE === 'true' && visualizer({
        open: true,
        filename: 'dist/stats.html',
        gzipSize: true,
        brotliSize: true
      }),
      // PWA 플러그인
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico'],
        manifest: {
          name: 'STUDYMATE',
          short_name: 'STUDYMATE',
          description: '언어 교환 학습 플랫폼',
          theme_color: '#00C471',
          background_color: '#ffffff',
          display: 'standalone',
          icons: []
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff,woff2}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/api\./i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-cache',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 5 * 60 // 5분
                }
              }
            },
            {
              urlPattern: /\.(png|jpg|jpeg|svg|gif|webp)$/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'image-cache',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 30 * 24 * 60 * 60 // 30일
                }
              }
            },
            {
              urlPattern: /\.(woff|woff2|eot|ttf|otf)$/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'font-cache',
                expiration: {
                  maxEntries: 20,
                  maxAgeSeconds: 365 * 24 * 60 * 60 // 1년
                }
              }
            }
          ]
        }
      })
    ].filter(Boolean),
    
    // 경로 별칭 설정
    resolve: {
      alias: {
        '@': '/src',
        '@components': '/src/components',
        '@pages': '/src/pages',
        '@hooks': '/src/hooks',
        '@utils': '/src/utils',
        '@services': '/src/services',
        '@store': '/src/store',
        '@api': '/src/api',
        '@styles': '/src/styles',
        '@assets': '/src/assets'
      },
      dedupe: ['react', 'react-dom']
    },
    
    // CSS 설정
    css: {
      postcss: {
        plugins: []
      },
      modules: {
        localsConvention: 'camelCase'
      }
    },
    
    // 개발 서버 설정
    server: {
      port: 3000,
      hmr: {
        overlay: true
      },
      proxy: {
        '/api/v1/login': {
          target: env.VITE_API_URL || 'http://localhost:8080',
          changeOrigin: true,
          rewrite: (p) => p,
        },
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:8080',
          changeOrigin: true,
          // rewrite: (path) => path.replace(/^\/api/, ''),
        },
        '/workers': {
          target: env.VITE_WORKERS_API_URL || 'http://localhost:8787',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/workers/, ''),
          secure: false,
          ws: true,
        },
        '/login/oauth2/code/naver': {
          target: env.VITE_API_URL || 'http://localhost:8080',
          changeOrigin: true,
        }
      },
      historyApiFallback: true,
    },
    
    // 의존성 최적화
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        'axios',
        'zustand',
        'jwt-decode',
        'sockjs-client',
        '@stomp/stompjs',
        'scheduler',
        'lucide-react'
      ],
      exclude: [
        // 큰 라이브러리들은 동적 import로 처리
        'emoji-picker-react',
        'recharts'
      ]
    },
    
    // 빌드 설정
    build: {
      outDir: 'dist',
      sourcemap: !isProduction,
      minify: isProduction ? 'terser' : false,
      target: 'es2019',
      
      // Terser 옵션 (프로덕션만)
      terserOptions: isProduction ? {
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.info', 'console.debug'],
        },
        format: {
          comments: false
        }
      } : undefined,
      
      commonjsOptions: {
        include: [/node_modules/],
        transformMixedEsModules: true,
        requireReturnsDefault: 'auto'
      },
      
      rollupOptions: {
        output: {
          // 에셋 파일명 최적화
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name.split('.');
            const ext = info[info.length - 1];
            
            if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico|webp)$/i.test(assetInfo.name)) {
              return `images/[name]-[hash].${ext}`;
            }
            if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name)) {
              return `fonts/[name]-[hash].${ext}`;
            }
            if (/\.(css)$/i.test(assetInfo.name)) {
              return `css/[name]-[hash].${ext}`;
            }
            return `assets/[name]-[hash].${ext}`;
          },
          
          chunkFileNames: (chunkInfo) => {
            // 타임스탬프를 포함하여 캐시 버스팅 강화
            const timestamp = Date.now().toString(36);
            return `js/[name]-[hash]-${timestamp}.js`;
          },
          entryFileNames: (chunkInfo) => {
            const timestamp = Date.now().toString(36);
            return `js/[name]-[hash]-${timestamp}.js`;
          },
          
          // 청킹 전략 최적화
          manualChunks: {
            // React 코어
            'vendor-react': ['react', 'react-dom'],
            // 라우팅
            'vendor-router': ['react-router-dom'],
            // 상태 관리
            'vendor-state': ['zustand'],
            // UI 라이브러리
            'vendor-ui': ['lucide-react'],
            // API & 네트워킹
            'vendor-api': ['axios', 'jwt-decode'],
            // 실시간 통신
            'vendor-socket': ['sockjs-client', '@stomp/stompjs'],
            // 큰 라이브러리들을 개별 청크로 분리
            'vendor-emoji': ['emoji-picker-react'],
            'vendor-charts': ['recharts'],
            'vendor-select': ['react-select']
          }
        }
      },
      
      // CSS 코드 분할
      cssCodeSplit: true,
      chunkSizeWarningLimit: 1000,
      
      // Preload 지시어 삽입
      modulePreload: {
        polyfill: true
      }
    },
    
    // 환경변수 정의
    define: {
      global: 'window', // sockjs-client 등 global 참조 패치
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
      __VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
      __DEV__: !isProduction
    }
  }
})
