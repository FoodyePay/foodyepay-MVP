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

  const handleConnect = async () => {
    if (isConnected && walletAddress) {
      // 如果已连接，触发回调
      onConnect?.(walletAddress);
    } else {
      // 连接钱包
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



