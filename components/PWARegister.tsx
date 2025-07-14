'use client';

import { useEffect } from 'react';

export default function PWARegister() {
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      process.env.NODE_ENV === 'production'
    ) {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((registration) => {
          console.log('🚀 Service Worker registered successfully:', registration);
        })
        .catch((error) => {
          console.error('❌ Service Worker registration failed:', error);
        });
    }
  }, []);

  return null; // 这个组件不渲染任何内容
}
