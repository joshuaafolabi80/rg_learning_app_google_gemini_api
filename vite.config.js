    import { defineConfig } from 'vite';
    import react from '@vitejs/plugin-react';
    import { VitePWA } from 'vite-plugin-pwa';

    // https://vitejs.dev/config/
    export default defineConfig({
      // This 'base' path is crucial for GitHub Pages when deploying to a subfolder (your repo name)
      base: '/rg-quiz-app/', // Make sure this matches your GitHub repository name exactly
      plugins: [
        react(),
        // VitePWA Plugin Configuration
        VitePWA({
          registerType: 'autoUpdate', // Automatically update the service worker
          injectRegister: 'auto',     // Automatically inject the service worker registration script into index.html
          workbox: {
            // Define which files should be precached by the service worker for offline access
            globPatterns: [
              '**/*.{js,css,html,ico,png,svg,webp,json}', // Common web assets
              'sounds/**/*.{mp3,wav}', // Ensure all sound files are included
            ],
            // Increase the file size limit for precaching, as your sound files are large
            maximumFileSizeToCacheInBytes: 15 * 1024 * 1024, // 15 MB
          },
          // Web App Manifest configuration
          manifest: {
            name: 'RG Quiz App',
            short_name: 'RG Quiz',
            description: 'Your ultimate quiz experience!',
            start_url: '/', // The start URL for the PWA (relative to the base)
            display: 'standalone', // Makes the app feel like a native app
            background_color: '#ffffff', // Background color for the splash screen
            theme_color: '#000000', // Theme color for browser UI
            icons: [ // Icons for different devices and purposes
              {
                src: 'favicon.ico',
                sizes: '48x48 32x32 24x24 16x16',
                type: 'image/x-icon'
              },
              {
                src: 'favicon-16x16.png',
                type: 'image/png',
                sizes: '16x16'
              },
              {
                src: 'favicon-32x32.png',
                type: 'image/png',
                sizes: '32x32'
              },
              {
                src: 'android-chrome-192x192.png',
                type: 'image/png',
                sizes: '192x192'
              },
              {
                src: 'android-chrome-512x512.png',
                type: 'image/png',
                sizes: '512x512'
              },
              {
                src: 'apple-touch-icon.png',
                type: 'image/png',
                sizes: '180x180',
                "purpose": "any"
              }
            ]
          },
        })
      ],
    });
    