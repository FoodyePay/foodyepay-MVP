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

  // 移动端检测和初始化调试
  useEffect(() => {
    console.log("[SmartWallet] useSmartWallet mounted");

    if (typeof window === "undefined") {
      console.log("[SmartWallet] window is undefined (SSR)");
      return;
    }

    console.log("[SmartWallet] Detected platform:", navigator.userAgent);
    console.log("[SmartWallet] Screen dimensions:", {
      width: window.screen.width,
      height: window.screen.height,
      isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    });

    // 检查 localStorage 是否可用
    try {
      const testKey = 'test_storage';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      console.log("[SmartWallet] localStorage is available");
    } catch (err) {
      console.error("[SmartWallet] localStorage is NOT available:", err);
    }

    console.log("[SmartWallet] Initial state:", {
      address,
      isConnected,
      status,
      storedWallet: localStorage.getItem('foodye_wallet')
    });
  }, []);

  // 自动连接逻辑
  useEffect(() => {
    const autoConnect = async () => {
      console.log("[SmartWallet] autoConnect triggered");
      
      // 检查是否有存储的钱包连接状态
      const storedWallet = localStorage.getItem('foodye_wallet');
      console.log("[SmartWallet] storedWallet:", storedWallet);
      console.log("[SmartWallet] current isConnected:", isConnected);
      
      if (storedWallet && !isConnected) {
        try {
          console.log("[SmartWallet] Attempting auto-reconnect...");
          setIsConnecting(true);
          
          // 尝试重新连接 Coinbase Smart Wallet
          const connector = coinbaseWallet({
            appName: 'FoodyePay',
            appLogoUrl: '/FoodyePayLogo.png',
            preference: 'smartWalletOnly', // 只使用 Smart Wallet
          });
          
          console.log("[SmartWallet] Connector created:", connector);
          
          connect({ connector });
          console.log("[SmartWallet] Connect called successfully");
        } catch (err) {
          console.error('[SmartWallet] Auto-connect failed:', err);
          setError('Failed to auto-connect wallet');
          // 清除无效的存储状态
          localStorage.removeItem('foodye_wallet');
        } finally {
          setIsConnecting(false);
        }
      } else {
        console.log("[SmartWallet] No auto-connect needed:", {
          hasStoredWallet: !!storedWallet,
          isConnected
        });
      }
    };

    autoConnect();
  }, [isConnected, connect]);

  // 更新本地存储
  useEffect(() => {
    console.log("[SmartWallet] Address/Connection state changed:", {
      address,
      isConnected,
      status
    });
    
    if (address && isConnected) {
      console.log("[SmartWallet] Storing wallet address:", address);
      localStorage.setItem('foodye_wallet', address);
      setError(null);
    } else if (!isConnected) {
      console.log("[SmartWallet] Removing stored wallet address");
      localStorage.removeItem('foodye_wallet');
    }
  }, [address, isConnected]);

  const connectWallet = async () => {
    console.log("[SmartWallet] Manual connectWallet called");
    
    try {
      setIsConnecting(true);
      setError(null);
      
      console.log("[SmartWallet] Creating connector...");
      const connector = coinbaseWallet({
        appName: 'FoodyePay',
        appLogoUrl: '/FoodyePayLogo.png',
        preference: 'smartWalletOnly',
      });
      
      console.log("[SmartWallet] Connector created:", connector);
      console.log("[SmartWallet] Calling connect...");
      
      connect({ connector });
      
      console.log("[SmartWallet] Connect function executed");
    } catch (err) {
      console.error('[SmartWallet] Connect wallet failed:', err);
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
