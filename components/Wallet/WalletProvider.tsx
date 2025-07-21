'use client';

import { createContext, useContext, useEffect, ReactNode } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';

type WalletContextType = {
  walletAddress: string | null;
  isSmartWallet: boolean;
  isConnected: boolean;
  isConnecting: boolean;
  connect: () => void;
  disconnect: () => void;
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const { address, isConnected, connector } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  // Check if it's a Smart Wallet (Coinbase Wallet with Smart Wallet preference)
  const isSmartWallet = connector?.id === 'coinbaseWalletSDK' && connector?.name?.includes('Coinbase') || false;

  useEffect(() => {
    // 当Wagmi钱包连接时，保存到localStorage
    if (address && isConnected) {
      localStorage.setItem('foodye_wallet', address);
      console.log('✅ Smart Wallet connected:', address);
      console.log('🔧 Connector:', connector?.name, connector?.id);
    }
  }, [address, isConnected, connector]);

  const handleConnect = () => {
    const coinbaseConnector = connectors.find(c => c.id === 'coinbaseWalletSDK');
    if (coinbaseConnector) {
      console.log('🔗 Connecting to Coinbase Smart Wallet...');
      connect({ connector: coinbaseConnector });
    } else {
      console.error('❌ Coinbase Wallet connector not found');
    }
  };

  const handleDisconnect = () => {
    disconnect();
    localStorage.removeItem('foodye_wallet');
    console.log('👋 Wallet disconnected');
  };

  const value = {
    walletAddress: address || null,
    isSmartWallet,
    isConnected,
    isConnecting: isPending,
    connect: handleConnect,
    disconnect: handleDisconnect,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useFoodyeWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useFoodyeWallet must be used within WalletProvider');
  return ctx;
}

