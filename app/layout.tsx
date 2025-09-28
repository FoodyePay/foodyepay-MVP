// ✅ 此文件为服务器组件（不使用 "use client"）
import '@coinbase/onchainkit/styles.css';
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME || 'FoodyePay',
  description: 'Web3 + Smart Wallet + QR 支付的餐饮支付 DApp',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'FoodyePay',
  },
  icons: {
    icon: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1e40af',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="FoodyePay" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className="bg-background dark min-h-screen flex flex-col">
        <Providers>
          <div className="flex-1">
            {children}
          </div>
          <footer className="mt-8 border-t border-neutral-800 text-sm text-neutral-400 px-4 py-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-4">
              <a href="/legal/terms" className="hover:text-neutral-200">Terms</a>
              <a href="/legal/privacy" className="hover:text-neutral-200">Privacy</a>
              <a href="/legal/risk-disclaimer" className="hover:text-neutral-200">Risk</a>
            </div>
            <div className="text-xs opacity-70">© {new Date().getFullYear()} FoodyePay. All rights reserved.</div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}



