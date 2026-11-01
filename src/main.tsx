import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        // Automatically check for updates on page load and every 5 minutes
        reg.update().catch(() => {});
        setInterval(() => {
          reg.update().catch(() => {});
        }, 5 * 60 * 1000);

        reg.addEventListener('updatefound', () => {
          const installingWorker = reg.installing;
          if (!installingWorker) return;
          installingWorker.addEventListener('statechange', () => {
            if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // A new version is installed, notify worker to activate immediately and reload
              installingWorker.postMessage({ type: 'SKIP_WAITING' });
            }
          });
        });
      })
      .catch(() => {});

    // Reload seamlessly when a NEW service worker replaces an old one.
    // On the very first visit there is no previous controller: clients.claim() fires
    // 'controllerchange' too, and reloading then just restarts whatever the user already opened
    // (e.g. the anatomy models that were still downloading).
    const hadController = !!navigator.serviceWorker.controller;
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!hadController) return;
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });
  });
}
