'use client';

import { useEffect } from 'react';
import { useFoodyeWallet } from './WalletProvider';

type Props = {
  onConnect?: (address: string) => void;
  disabled?: boolean;
};

export default function ConnectWallet({ onConnect, disabled }: Props) {
  const { 
    walletAddress, 
    isConnected, 
    isConnecting, 
    error, 
    connectWallet, 
    disconnectWallet 
  } = useFoodyeWallet();

  // 移动端检测和环境检查
  useEffect(() => {
    console.log("[ConnectWallet] Component mounted");
    
    if (typeof window !== 'undefined') {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isInApp = /MicroMessenger|WeChat|QQ|TikTok|Snapchat/i.test(navigator.userAgent);
      
      console.log("[ConnectWallet] Environment check:", {
        isMobile,
        isInApp,
        userAgent: navigator.userAgent,
        location: window.location.href,
        opener: !!window.opener,
        parent: window.parent !== window
      });

      // 检查弹窗权限
      if (isMobile) {
        try {
          const popup = window.open('', '_blank', 'width=1,height=1');
          if (popup) {
            popup.close();
            console.log("[ConnectWallet] Popup permissions: ALLOWED");
          } else {
            console.warn("[ConnectWallet] Popup permissions: BLOCKED");
          }
        } catch (err) {
          console.error("[ConnectWallet] Popup test failed:", err);
        }
      }
    }
  }, []);

  const handleConnect = async () => {
    console.log("[ConnectWallet] handleConnect called:", {
      isConnected,
      walletAddress,
      isConnecting
    });
    
    if (isConnected && walletAddress) {
      // 如果已连接，触发回调
      console.log("[ConnectWallet] Already connected, calling onConnect");
      onConnect?.(walletAddress);
    } else {
      // 连接钱包
      console.log("[ConnectWallet] Calling connectWallet...");
      await connectWallet();
      // 连接成功后，walletAddress 会通过 hook 更新
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
  };

  // 监听钱包地址变化，触发回调
  useEffect(() => {
    if (isConnected && walletAddress) {
      onConnect?.(walletAddress);
    }
  }, [walletAddress, isConnected, onConnect]);

  if (isConnected && walletAddress) {
    return (
      <div className="flex flex-col items-center gap-2">
        <div className="text-sm text-green-600">
          ✅ Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
        </div>
        <button
          onClick={handleDisconnect}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
          disabled={disabled}
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      {error && (
        <div className="text-sm text-red-500">
          ❌ {error}
        </div>
      )}
      <button
        onClick={handleConnect}
        disabled={disabled || isConnecting}
        className={`px-6 py-2 rounded font-medium ${
          disabled || isConnecting
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        } text-white`}
      >
        {isConnecting ? '🔄 Connecting...' : '🔗 Connect Smart Wallet'}
      </button>
    </div>
  );
}



