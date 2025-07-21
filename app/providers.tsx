'use client';

import { OnchainProviders } from '@/components/Wallet/OnchainProviders';
import { WalletProvider } from '@/components/Wallet/WalletProvider';
import type { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <OnchainProviders>
      <WalletProvider>
        {children}
      </WalletProvider>
    </OnchainProviders>
  );
}



