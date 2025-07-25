import { Workbox } from 'workbox-window'; 

export function register() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      // Create a new Workbox instance
      const wb = new Workbox('/sw.js'); // Assuming your service worker file is still /sw.js

      wb.register().then(
        (registration) => {
          console.log('ServiceWorker registration successful with scope: ', registration.scope);

          // Workbox handles updates more gracefully.
          // You can listen for specific events to notify the user about updates.
          // For example, to prompt a reload when a new service worker is waiting:
          wb.addEventListener('waiting', () => {
            console.log('A new service worker is waiting!');
            // You might want to display a UI prompt to the user here,
            // asking them to refresh the page to get the latest version.
            // Example:
            // if (confirm('New content is available! Click OK to refresh.')) {
            //   wb.messageSW({ type: 'SKIP_WAITING' });
            // }
          });

          // If you want to force an update check periodically (though Workbox
          // also handles this based on navigation and other events), you can
          // still use `registration.update()`, but it's often not strictly
          // necessary with `workbox-window`.
          // If you decide to keep it, make sure your service worker also handles
          // the "skipWaiting" logic if you want immediate activation.
          // setInterval(() => {
          //   registration.update().catch(err => {
          //     console.log('ServiceWorker update failed: ', err);
          //   });
          // }, 60 * 60 * 1000); // Check every hour (optional, Workbox handles updates well)

        },
        (err) => {
          console.log('ServiceWorker registration failed: ', err);
        }
      );
    });
  }
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.unregister();
    });
  }
}