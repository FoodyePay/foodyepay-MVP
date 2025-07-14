// ✅ 此文件为服务器组件（不使用 "use client"）
import '@coinbase/onchainkit/styles.css';
import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import PWARegister from '@/components/PWARegister';

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME || 'FoodyePay',
  description: 'Web3 + Smart Wallet + QR 支付的餐饮支付 DApp',
  manifest: '/manifest.json',
  themeColor: '#1f1f1f',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  icons: {
    icon: '/icons/icon-192x192.png',
    apple: '/icons/icon-192x192.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'FoodyePay',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1f1f1f" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="FoodyePay" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className="bg-background dark">
        <PWARegister />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}



