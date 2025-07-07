'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type WalletContextType = {
  walletAddress: string | null;
  isSmartWallet: boolean;
  setWalletAddress: (address: string | null) => void;
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isSmartWallet, setIsSmartWallet] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('foodye_wallet');
    if (stored) {
      setWalletAddress(stored);
      setIsSmartWallet(true); // 默认设为 Smart Wallet，后续可扩展检测逻辑
    }
  }, []);

  const value = {
    walletAddress,
    isSmartWallet,
    setWalletAddress,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useFoodyeWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useFoodyeWallet must be used within WalletProvider');
  return ctx;
}

