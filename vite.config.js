    import { defineConfig } from 'vite';
    import react from '@vitejs/plugin-react';
    import { VitePWA } from 'vite-plugin-pwa';

    // https://vitejs.dev/config/
    export default defineConfig({
      // IMPORTANT: Set base to '/' for Netlify deployment
      base: '/', 
      plugins: [
        react(),
        VitePWA({
          registerType: 'autoUpdate',
          injectRegister: 'auto',
          workbox: {
            globPatterns: [
              '**/*.{js,css,html,ico,png,svg,webp,mp3,wav,json}',
              'sounds/**/*.{mp3,wav}',
            ],
            maximumFileSizeToCacheInBytes: 15 * 1024 * 1024,
          },
          manifest: {
            name: 'RG Quiz App',
            short_name: 'RG Quiz',
            description: 'Your ultimate quiz experience!',
            start_url: '/', // Keep this as '/'
            display: 'standalone',
            background_color: '#ffffff',
            theme_color: '#000000',
            icons: [
              { src: 'favicon.ico', sizes: '48x48 32x32 24x24 16x16', type: 'image/x-icon' },
              { src: 'favicon-16x16.png', type: 'image/png', sizes: '16x16' },
              { src: 'favicon-32x32.png', type: 'image/png', sizes: '32x32' },
              { src: 'android-chrome-192x192.png', type: 'image/png', sizes: '192x192' },
              { src: 'android-chrome-512x512.png', type: 'image/png', sizes: '512x512' },
              { src: 'apple-touch-icon.png', type: 'image/png', sizes: '180x180', "purpose": "any" }
            ]
          },
        })
      ],
    });
    