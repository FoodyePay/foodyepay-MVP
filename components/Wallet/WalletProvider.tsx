'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useSmartWallet } from './useSmartWallet';

type WalletContextType = {
  // 状态
  walletAddress: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  isSmartWallet: boolean;
  error: string | null;
  
  // 方法
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  
  // 向后兼容的方法
  setWalletAddress: (address: string | null) => void;
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const { 
    address, 
    isConnected, 
    isConnecting, 
    error, 
    connectWallet, 
    disconnectWallet 
  } = useSmartWallet();

  console.log("[WalletProvider] State update:", {
    address,
    isConnected,
    isConnecting,
    error
  });

  // 向后兼容的 setWalletAddress 方法
  const setWalletAddress = (address: string | null) => {
    if (address) {
      localStorage.setItem('foodye_wallet', address);
    } else {
      localStorage.removeItem('foodye_wallet');
      disconnectWallet();
    }
  };

  const value: WalletContextType = {
    // 状态
    walletAddress: address || null,
    isConnected,
    isConnecting,
    isSmartWallet: true, // 我们专注于 Smart Wallet
    error,
    
    // 方法
    connectWallet,
    disconnectWallet,
    setWalletAddress,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useFoodyeWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useFoodyeWallet must be used within WalletProvider');
  return ctx;
}

