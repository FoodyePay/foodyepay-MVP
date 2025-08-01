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
import DinerRewards from '@/components/DinerRewards';

export default function DinerDashboard() {
  const { address } = useAccount();
  const [userName, setUserName] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showRewards, setShowRewards] = useState(false);
  
  // 🆕 支付确认状态
  const [showPaymentConfirm, setShowPaymentConfirm] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

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
      // 解析二维码数据 (新格式: JSON)
      const scannedPaymentData = JSON.parse(qrData);
      
      console.log('Scanned payment info:', scannedPaymentData);
      
      // 设置支付数据和显示确认模态框
      setPaymentData(scannedPaymentData);
      setShowPaymentConfirm(true);
      setShowQRScanner(false); // 关闭扫描器
      
    } catch (error) {
      console.error('QR code processing failed:', error);
      
      // 尝试解析旧格式 (向后兼容)
      try {
        const [restaurantId, orderId, amount] = qrData.split(':');
        alert(`Scan successful! (Legacy Format)\nRestaurant ID: ${restaurantId}\nOrder ID: ${orderId}\nAmount: ${amount} USDC`);
      } catch {
        alert('Invalid QR code format, please scan again');
      }
    }
  };

  // 🆕 处理支付确认
  const handleConfirmPayment = async () => {
    if (!paymentData || !address) return;
    
    setIsProcessingPayment(true);
    
    try {
      // TODO: 实现实际的区块链支付逻辑
      // 1. 检查USDC余额
      // 2. 执行USDC转账到餐厅地址
      // 3. 记录交易历史
      // 4. 更新支付状态
      
      console.log('Processing payment...', {
        from: address,
        to: paymentData.restaurantId,
        amount: paymentData.amounts.usdc,
        orderId: paymentData.orderId
      });
      
      // 模拟支付处理时间
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 支付成功
      alert(`Payment Successful! 🎉\n\nPaid: $${paymentData.amounts.usdc.toFixed(2)} USDC\nTo: ${paymentData.restaurantInfo?.name}\nOrder: ${paymentData.orderId}`);
      
      setShowPaymentConfirm(false);
      setPaymentData(null);
      
    } catch (error) {
      console.error('Payment failed:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setIsProcessingPayment(false);
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
        
        {/* � 主要功能按钮 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl">
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
            <span>�</span>
            <span>Transaction History</span>
          </button>
          
          <button
            onClick={() => setShowRewards(true)}
            className="flex items-center justify-center space-x-2 bg-[#222c4e] hover:bg-[#454b80] text-white px-6 py-4 rounded-lg font-semibold transition-colors"
          >
            <span>🎁</span>
            <span>My Rewards</span>
          </button>
        </div>

        {/* ✅ Buy ETH */}
        <div className="flex items-center space-x-2">
          <span className="text-xl font-semibold">Buy</span>
          <Buy toToken={ethToken} />
        </div>

        {/* 🔄 ETH → USDC Swap */}
        <div className="flex items-center space-x-2">
          {/* <span className="text-xl font-semibold">ETH → USDC</span> */}
          <SwapDefault 
            from={[ethToken]} 
            to={[usdcToken]} 
          />
        </div>

        {/* 🍔 USDC → FOODY Swap */}
        <div className="flex items-center space-x-2">
          {/*<span className="text-xl font-semibold">USDC → FOODY</span>*/}
          <SwapDefault 
            from={[usdcToken]} 
            to={[foodyToken]} 
          />
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

      {/* 🎁 我的奖励弹窗 */}
      {showRewards && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-xl p-6 w-full max-w-md relative">
            <button
              onClick={() => setShowRewards(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl"
            >
              ✕
            </button>
            
            <h2 className="text-xl font-bold text-yellow-400 mb-4">🎁 My Rewards</h2>
            
            <DinerRewards className="w-full" />
          </div>
        </div>
      )}

      {/* 🆕 支付确认模态框 */}
      {showPaymentConfirm && paymentData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-xl p-6 w-full max-w-lg relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setShowPaymentConfirm(false);
                setPaymentData(null);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl"
            >
              ✕
            </button>
            
            <h2 className="text-xl font-bold text-green-400 mb-4">✅ Scan Successful!</h2>
            
            <div className="space-y-4 text-sm">
              {/* 餐厅信息 */}
              <div className="bg-zinc-800 rounded-lg p-4">
                <h3 className="font-semibold text-purple-400 mb-2">🏪 Restaurant Info</h3>
                <p className="text-white font-medium">{paymentData.restaurantInfo?.name || 'N/A'}</p>
                <p className="text-gray-300">{paymentData.restaurantInfo?.address || 'N/A'}</p>
                <p className="text-gray-300">{paymentData.restaurantInfo?.email || 'N/A'}</p>
                <p className="text-gray-300">{paymentData.restaurantInfo?.phone || 'N/A'}</p>
              </div>

              {/* 订单信息 */}
              <div className="bg-zinc-800 rounded-lg p-4">
                <h3 className="font-semibold text-blue-400 mb-2">📋 Order Details</h3>
                <p className="text-white">Order: <span className="font-mono">{paymentData.orderId}</span></p>
                <p className="text-white">Table: {paymentData.tableNumber || 'N/A'}</p>
              </div>

              {/* 支付详情 */}
              <div className="bg-zinc-800 rounded-lg p-4">
                <h3 className="font-semibold text-green-400 mb-2">💰 Payment Details</h3>
                <div className="space-y-1">
                  <p className="text-white">Subtotal: <span className="font-mono">${paymentData.amounts.subtotal.toFixed(2)} USDC</span></p>
                  <p className="text-white">Tax: <span className="font-mono">${paymentData.amounts.tax.toFixed(2)} USDC</span></p>
                  <div className="border-t border-gray-600 pt-2 mt-2">
                    <p className="text-white font-bold text-lg">Total: <span className="font-mono">${paymentData.amounts.usdc.toFixed(2)} USDC</span></p>
                  </div>
                  <p className="text-yellow-400">FOODY: <span className="font-mono">{paymentData.amounts.foody.toLocaleString()} FOODY</span></p>
                </div>
              </div>

              {/* 税率信息 */}
              {paymentData.taxInfo && (
                <div className="bg-zinc-800 rounded-lg p-4">
                  <h3 className="font-semibold text-yellow-400 mb-2">📊 Tax Info</h3>
                  <p className="text-white">{(paymentData.taxInfo.rate * 100).toFixed(3)}% ({paymentData.taxInfo.state})</p>
                </div>
              )}

              {/* 时间戳 */}
              <div className="bg-zinc-800 rounded-lg p-4">
                <h3 className="font-semibold text-gray-400 mb-2">⏰ Timestamps</h3>
                <p className="text-white">Created: {paymentData.paymentCreatedAt ? new Date(paymentData.paymentCreatedAt).toLocaleString() : new Date(paymentData.timestamp).toLocaleString()}</p>
                <p className="text-white">Scanned: {new Date().toLocaleString()}</p>
              </div>
            </div>

            {/* 🔥 支付按钮 */}
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowPaymentConfirm(false);
                  setPaymentData(null);
                }}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors"
                disabled={isProcessingPayment}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPayment}
                disabled={isProcessingPayment}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-500 text-white py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center"
              >
                {isProcessingPayment ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Processing...
                  </>
                ) : (
                  'Confirm & Pay'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
