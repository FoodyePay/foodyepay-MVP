'use client';

import { OnchainKitProvider } from '@coinbase/onchainkit';
import { WalletProvider } from '@/components/Wallet/WalletProvider'; // ✅ 引入自定义 WalletProvider
import { base } from 'wagmi/chains';
import type { ReactNode } from 'react';
import { useEffect } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    console.log("[Providers] OnchainKitProvider initialized with:", {
      apiKey: process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY ? '***SET***' : 'MISSING',
      projectId: process.env.NEXT_PUBLIC_COINBASE_APP_ID ? '***SET***' : 'MISSING',
      chain: base.name,
      chainId: base.id
    });
  }, []);

  return (
    <OnchainKitProvider
      apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
      projectId={process.env.NEXT_PUBLIC_COINBASE_APP_ID}
      chain={base}
      config={{
        appearance: {
          mode: 'auto',
        },
      }}
    >
      <WalletProvider>
        {children}
      </WalletProvider>
    </OnchainKitProvider>
  );
}



