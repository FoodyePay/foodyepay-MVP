'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownLink,
  WalletDropdownDisconnect,
} from '@coinbase/onchainkit/wallet';

import {
  Address,
  Avatar,
  Name,
  Identity,
  EthBalance,
} from '@coinbase/onchainkit/identity';

import { Buy } from '@coinbase/onchainkit/buy';
import { SwapDefault } from '@coinbase/onchainkit/swap';
import type { Token } from '@coinbase/onchainkit/token';
import { supabase } from '@/lib/supabase';
import { QRScanner } from '@/components/QRScanner';
import { TransactionHistory } from '@/components/TransactionHistory';
import { FoodyBalance } from '@/components/FoodyBalance';

export default function DinerDashboard() {
  const { address } = useAccount();
  const [userName, setUserName] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // 🔥 获取用户姓名和ID信息
  useEffect(() => {
    const fetchUserName = async () => {
      if (!address) return;
      
      try {
        const { data, error } = await supabase
          .from('diners')
          .select('id, first_name, last_name')
          .eq('wallet_address', address)
          .single();
        
        if (error) {
          console.error('Error fetching user:', error);
          return;
        }
        
        if (data) {
          setUserName(data.first_name); // 🔥 只使用 first_name
          setUserId(data.id); // 🔥 获取 UUID
        }
      } catch (err) {
        console.error('Failed to fetch user name:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserName();
  }, [address]);

  // 🔥 处理二维码扫描结果
  const handleQRScan = async (qrData: string) => {
    try {
      // 解析二维码数据 (假设格式: restaurant_id:order_id:amount)
      const [restaurantId, orderId, amount] = qrData.split(':');
      
      console.log('Scanned payment info:', { restaurantId, orderId, amount });
      
      // 这里可以跳转到支付页面或显示支付确认
      alert(`Scan successful!\nRestaurant ID: ${restaurantId}\nOrder ID: ${orderId}\nAmount: ${amount} USDC`);
      
      // TODO: 实现实际的支付流程
      
    } catch (error) {
      console.error('QR code processing failed:', error);
      alert('Invalid QR code format, please scan again');
    }
  };

  const chainId = 8453;

  const ethToken: Token = {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
    address: '', // Native ETH
    chainId,
    image:
      'https://dynamic-assets.coinbase.com/dbb4b4983bde81309ddab83eb598358eb44375b930b94687ebe38bc22e52c3b2125258ffb8477a5ef22e33d6bd72e32a506c391caa13af64c00e46613c3e5806/asset_icons/4113b082d21cc5fab17fc8f2d19fb996165bcce635e6900f7fc2d57c4ef33ae9.png',
  };

  const usdcToken: Token = {
    name: 'USDC',
    address: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
    symbol: 'USDC',
    decimals: 6,
    chainId,
    image:
      'https://dynamic-assets.coinbase.com/3c15df5e2ac7d4abbe9499ed9335041f00c620f28e8de2f93474a9f432058742cdf4674bd43f309e69778a26969372310135be97eb183d91c492154176d455b8/asset_icons/9d67b728b6c8f457717154b3a35f9ddc702eae7e76c4684ee39302c4d7fd0bb8.png',
  };

  const foodyToken: Token = {
    name: 'Foodye Coin',
    symbol: 'FOODY',
    decimals: 18,
    address: '0x1022b1b028a2237c440dbac51dc6fc220d88c08f',
    chainId,
    image: '/foody.png',
  };

  return (
    <div className="flex flex-col min-h-screen font-sans dark:bg-black dark:text-white bg-white text-black">
      {/* 🎉 Welcome Banner */}
      <div className="bg-[#222c4e] text-white p-4 text-center border-b border-zinc-800">
        <h1 className="text-2xl font-bold">
          {loading ? (
            "Welcome to FoodyePay!"
          ) : userName ? (
            `Welcome to FoodyePay, ${userName}!`
          ) : (
            "Welcome to FoodyePay!"
          )}
        </h1>
        <p className="text-blue-100 mt-1">Your Web3 food payment dashboard</p>
        {userId && (
          <p className="text-xs text-blue-200 mt-2 font-mono">
            User ID: {userId}
          </p>
        )}
      </div>

      {/* ✅ Wallet Header */}
      <header className="p-4 flex justify-end">
        <Wallet>
          <ConnectWallet>
            <Avatar className="h-6 w-6" />
            <Name />
          </ConnectWallet>
          <WalletDropdown>
            <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
              <Avatar />
              <Name />
              <Address />
              <EthBalance />
            </Identity>
            <WalletDropdownLink
              icon="wallet"
              href="https://keys.coinbase.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Wallet
            </WalletDropdownLink>
            <WalletDropdownDisconnect />
          </WalletDropdown>
        </Wallet>
      </header>

      {/* ✅ Main UI */}
      <main className="flex-grow flex flex-col items-center justify-start p-6 space-y-8">
        
        {/* 🆕 FOODY 余额显示 */}
        <div className="w-full max-w-md">
          <FoodyBalance />
        </div>
        
        {/* 🆕 扫描支付 & 交易历史 按钮 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-md">
          <button
            onClick={() => setShowQRScanner(true)}
            className="flex items-center justify-center space-x-2 bg-[#222c4e] hover:bg-[#454b80] text-white px-6 py-4 rounded-lg font-semibold transition-colors"
          >
            <span>📱</span>
            <span>Scan To Pay</span>
          </button>
          
          <button
            onClick={() => setShowHistory(true)}
            className="flex items-center justify-center space-x-2 bg-[#222c4e] hover:bg-[#454b80] text-white px-6 py-4 rounded-lg font-semibold transition-colors"
          >
            <span>📋</span>
            <span>Transaction History</span>
          </button>
        </div>

        {/* ✅ Buy ETH */}
        <div className="flex items-center space-x-2">
          <span className="text-xl font-semibold">Buy</span>
          <Buy toToken={ethToken} />
        </div>

        {/* ✅ Swap ETH → USDC */}
        <div className="w-full max-w-md">
          <h2 className="font-semibold text-lg mb-2">Swap ETH to USDC</h2>
          <SwapDefault from={[ethToken]} to={[usdcToken]} />
        </div>

        {/* ✅ Swap USDC → FOODY */}
        <div className="w-full max-w-md">
          <h2 className="font-semibold text-lg mb-2">Swap USDC to FOODY</h2>
          <SwapDefault from={[usdcToken]} to={[foodyToken]} />
        </div>
      </main>

      {/* 🆕 二维码扫描器 */}
      <QRScanner
        isOpen={showQRScanner}
        onClose={() => setShowQRScanner(false)}
        onScan={handleQRScan}
        onError={(error) => {
          console.error('QR Scanner Error:', error);
          alert('Scan failed, please try again');
        }}
      />

      {/* 🆕 交易历史 */}
      <TransactionHistory
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
      />
    </div>
  );
}
