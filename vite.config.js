import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { visualizer } from 'rollup-plugin-visualizer'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const isProduction = mode === 'production'
  
  return {
    plugins: [
      react(),
      tailwindcss(),
      process.env.ANALYZE === 'true' && visualizer({
        open: true,
        filename: 'dist/stats.html',
        gzipSize: true,
        brotliSize: true
      }),
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
                expiration: { maxEntries: 50, maxAgeSeconds: 5 * 60 }
              }
            },
            {
              urlPattern: /\.(png|jpg|jpeg|svg|gif|webp)$/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'image-cache',
                expiration: { maxEntries: 100, maxAgeSeconds: 30 * 24 * 60 * 60 }
              }
            },
            {
              urlPattern: /\.(woff|woff2|eot|ttf|otf)$/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'font-cache',
                expiration: { maxEntries: 20, maxAgeSeconds: 365 * 24 * 60 * 60 }
              }
            }
          ]
        }
      })
    ].filter(Boolean),
    
    resolve: {
      // react-is도 중복 방지
      dedupe: ['react', 'react-dom', 'react-is'],
      alias: [
        // ✅ react-is 전 경로(딥 임포트 포함) → shim 강제 치환
        {
          find: /^react-is(\/.*)?$/,
          replacement: path.resolve(process.cwd(), 'src/shims/react-is.js'),
        },

        // ✅ eventemitter3 CJS 호환성 강제
        {
          find: 'eventemitter3',
          replacement: 'eventemitter3/index.js',
        },

        // ✅ lodash CJS → lodash-es 매핑
        { find: /^lodash\/([^/]+)\.js$/, replacement: 'lodash-es/$1.js' },
        { find: /^lodash\/([^/]+)$/,    replacement: 'lodash-es/$1.js' },

        // 기존 별칭 유지
        { find: '@', replacement: '/src' },
        { find: '@components', replacement: '/src/components' },
        { find: '@pages', replacement: '/src/pages' },
        { find: '@hooks', replacement: '/src/hooks' },
        { find: '@utils', replacement: '/src/utils' },
        { find: '@services', replacement: '/src/services' },
        { find: '@store', replacement: '/src/store' },
        { find: '@api', replacement: '/src/api' },
        { find: '@styles', replacement: '/src/styles' },
        { find: '@assets', replacement: '/src/assets' }
      ],
    },

    css: {
      postcss: { plugins: [] },
      modules: { localsConvention: 'camelCase' }
    },
    
    server: {
      port: 3000,
      hmr: { overlay: true },
      proxy: {
        '/api/v1/login': {
          target: env.VITE_API_URL || 'http://localhost:8080',
          changeOrigin: true,
          rewrite: (p) => p,
        },
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:8080',
          changeOrigin: true,
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
        'lucide-react',
        'lodash-es/get',
        'lodash-es/set',
        'lodash-es/pick',
        'lodash-es/isNaN',
        'lodash-es/isNil',
        'lodash-es/isNumber',
        'lodash-es/isFinite',
        'lodash-es/toNumber',
        'lodash-es/clamp',
        'lodash-es/isString',
        // ✅ CJS → ESM interop 강제
    'prop-types',
     'react-smooth',
     'react-transition-group',
      ],
      
      exclude: [
        // 🔴 프리번들 제외: alias가 반드시 적용되도록
        // 'react-is',
        'emoji-picker-react',
        'eventemitter3'
      ]
    },
    
    build: {
      outDir: 'dist',
      sourcemap: !isProduction,
      minify: isProduction ? 'terser' : false,
      target: 'es2019',
      terserOptions: isProduction ? {
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.info', 'console.debug'],
        },
        format: { comments: false }
      } : undefined,
      commonjsOptions: {
        include: [/node_modules/],
        transformMixedEsModules: true,
        requireReturnsDefault: 'auto'
      },
      rollupOptions: {
        output: {
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name.split('.');
            const ext = info[info.length - 1];
            if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico|webp)$/i.test(assetInfo.name)) {
              return `images/[name]-[hash].${ext}`;
            }
            if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name)) {
              return `fonts/[name]-[hash].${ext}`;
            }
            if (/\.css$/i.test(assetInfo.name)) {
              return `css/[name]-[hash].${ext}`;
            }
            return `assets/[name]-[hash].${ext}`;
          },
          chunkFileNames: () => `js/[name]-[hash]-${Date.now().toString(36)}.js`,
          entryFileNames: () => `js/[name]-[hash]-${Date.now().toString(36)}.js`,
          manualChunks: {
            'vendor-react': ['react', 'react-dom'],
            'vendor-router': ['react-router-dom'],
            'vendor-state': ['zustand'],
            'vendor-ui': ['lucide-react'],
            'vendor-api': ['axios', 'jwt-decode'],
            'vendor-socket': ['sockjs-client', '@stomp/stompjs'],
            'vendor-emoji': ['emoji-picker-react'],
            'vendor-charts': ['recharts'],
            'vendor-select': ['react-select']
          }
        }
      },
      cssCodeSplit: true,
      chunkSizeWarningLimit: 1000,
      modulePreload: { polyfill: true }
    },
    
    define: {
      global: 'window',
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
      __VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
      __DEV__: !isProduction
    }
  }
})
