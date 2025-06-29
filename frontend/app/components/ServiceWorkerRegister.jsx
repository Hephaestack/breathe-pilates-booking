"use client";
// Registers the service worker for PWA support
import { useEffect } from 'react';

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
          .then(reg => {
            // Registration successful
          })
          .catch(err => {
            // Registration failed
            console.error('Service worker registration failed:', err);
          });
      });
    }
  }, []);
  return null;
}
