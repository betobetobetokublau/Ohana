'use client';

import { useEffect } from 'react';

export function PWARegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      // Silent failure · si el registro falla, la app funciona sin PWA features.
      // En el futuro se canaliza a error tracker (Sentry o similar).
      navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {});
    }
  }, []);

  return null;
}
