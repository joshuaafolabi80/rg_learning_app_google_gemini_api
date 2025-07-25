import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  base: '/',
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          ui: ['react-bootstrap', 'react-icons', 'lucide-react'],
          animation: ['framer-motion'],
          audio: ['howler'],
          fonts: ['@fortawesome/fontawesome-free'],
          pwa: ['vite-plugin-pwa']
        }
      }
    }
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      workbox: {
        globPatterns: [
          '**/*.{js,css,html,ico,png,svg,webp,mp3,wav,json,webmanifest}',
        ],
        maximumFileSizeToCacheInBytes: 20 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: /\/all_quiz_data\.json/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'quiz-data-cache',
              expiration: {
                maxEntries: 1,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          },
          {
            urlPattern: /\.(mp3|wav)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'audio-assets',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          },
          {
            urlPattern: /\.(png|svg|jpg|jpeg|webp)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-assets',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          }
        ],
        navigateFallback: '/index.html',
        clientsClaim: true,
        skipWaiting: true,
        cleanupOutdatedCaches: true,
        offlineGoogleAnalytics: false
      },
      manifest: {
        name: 'RG Quiz App',
        short_name: 'RG Quiz',
        description: 'Your ultimate quiz experience!',
        start_url: '/?source=pwa',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#000000',
        orientation: 'portrait',
        icons: [
          { src: 'favicon.ico', sizes: '48x48 32x32 24x24 16x16', type: 'image/x-icon' },
          { src: 'favicon-16x16.png', type: 'image/png', sizes: '16x16' },
          { src: 'favicon-32x32.png', type: 'image/png', sizes: '32x32' },
          { src: 'android-chrome-192x192.png', type: 'image/png', sizes: '192x192', purpose: 'any maskable' },
          { src: 'android-chrome-512x512.png', type: 'image/png', sizes: '512x512', purpose: 'any maskable' },
          { src: 'apple-touch-icon.png', type: 'image/png', sizes: '180x180', purpose: 'any' }
        ],
        shortcuts: [
          {
            name: 'Start Quiz',
            short_name: 'Quiz',
            description: 'Start a new quiz',
            url: '/setup?source=pwa',
            icons: [{ src: '/icons/quiz-icon.png', sizes: '192x192' }]
          },
          {
            name: 'View Scores',
            short_name: 'Scores',
            description: 'View your quiz scores',
            url: '/view-score?source=pwa',
            icons: [{ src: '/icons/scores-icon.png', sizes: '192x192' }]
          }
        ]
      },
      devOptions: {
        enabled: true,
        type: 'module',
        navigateFallback: 'index.html'
      }
    }),
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
      template: 'treemap'
    })
  ]
});