'use client';

import { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { coinbaseWallet } from 'wagmi/connectors';

export function useSmartWallet() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { address, isConnected, status } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  // 自动连接逻辑
  useEffect(() => {
    const autoConnect = async () => {
      // 检查是否有存储的钱包连接状态
      const storedWallet = localStorage.getItem('foodye_wallet');
      if (storedWallet && !isConnected) {
        try {
          setIsConnecting(true);
          // 尝试重新连接 Coinbase Smart Wallet
          connect({ 
            connector: coinbaseWallet({
              appName: 'FoodyePay',
              appLogoUrl: '/FoodyePayLogo.png',
              preference: 'smartWalletOnly', // 只使用 Smart Wallet
            })
          });
        } catch (err) {
          console.error('Auto-connect failed:', err);
          setError('Failed to auto-connect wallet');
          // 清除无效的存储状态
          localStorage.removeItem('foodye_wallet');
        } finally {
          setIsConnecting(false);
        }
      }
    };

    autoConnect();
  }, [isConnected, connect]);

  // 更新本地存储
  useEffect(() => {
    if (address && isConnected) {
      localStorage.setItem('foodye_wallet', address);
      setError(null);
    } else if (!isConnected) {
      localStorage.removeItem('foodye_wallet');
    }
  }, [address, isConnected]);

  const connectWallet = async () => {
    try {
      setIsConnecting(true);
      setError(null);
      
      connect({ 
        connector: coinbaseWallet({
          appName: 'FoodyePay',
          appLogoUrl: '/FoodyePayLogo.png',
          preference: 'smartWalletOnly',
        })
      });
    } catch (err) {
      console.error('Connect wallet failed:', err);
      setError('Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    disconnect();
    localStorage.removeItem('foodye_wallet');
    setError(null);
  };

  return {
    // 状态
    address,
    isConnected,
    isConnecting: isConnecting || status === 'connecting',
    error,
    
    // 方法
    connectWallet,
    disconnectWallet,
  };
}

// Future: Add SIWE Sign-In before proceeding
