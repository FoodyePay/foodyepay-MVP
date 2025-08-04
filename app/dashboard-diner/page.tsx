'use client';

import { useState, useEffect } from 'react';
import { useAccount, useConfig } from 'wagmi';
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
import TransactionHistory from '@/components/TransactionHistory';
import { FoodyBalance } from '@/components/FoodyBalance';
import DinerRewards from '@/components/DinerRewards';
import { WalletQRCode } from '@/components/WalletQRCode';
import { FriendPayment } from '@/components/FriendPayment';
import { executeFoodyPayment, checkFoodyBalance, formatTransactionHash, getTransactionUrl, type PaymentRequest, type PaymentResult } from '@/lib/paymentService';

export default function DinerDashboard() {
  const { address } = useAccount();
  const config = useConfig(); // 🆕 获取wagmi config
  const [userName, setUserName] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [userPhone, setUserPhone] = useState<string>('');
  const [userCreatedAt, setUserCreatedAt] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showRewards, setShowRewards] = useState(false);
  const [showPortfolio, setShowPortfolio] = useState(false);
  const [showFriendPayment, setShowFriendPayment] = useState(false);
  
  // 🆕 支付确认状态
  const [showPaymentConfirm, setShowPaymentConfirm] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccessful, setPaymentSuccessful] = useState(false); // 🚨 新增支付成功状态

  // 🔥 获取用户姓名和ID信息
  useEffect(() => {
    const fetchUserName = async () => {
      if (!address) return;
      
      try {
        const { data, error } = await supabase
          .from('diners')
          .select('id, first_name, last_name, email, phone, created_at')
          .eq('wallet_address', address)
          .single();
        
        if (error) {
          console.error('Error fetching user:', error);
          return;
        }
        
        if (data) {
          setUserName(data.first_name); // 🔥 只使用 first_name
          setUserId(data.id); // 🔥 获取 UUID
          setUserEmail(data.email);
          setUserPhone(data.phone);
          setUserCreatedAt(data.created_at);
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
      setPaymentSuccessful(false); // 🚨 重置支付成功状态
      
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

  // 🆕 处理FOODY支付确认 🔥
  const handleConfirmPayment = async () => {
    if (!paymentData || !address) return;
    
    setIsProcessingPayment(true);
    
    try {
      // 构建支付请求
      const paymentRequest: PaymentRequest = {
        fromAddress: address as `0x${string}`,
        toAddress: paymentData.restaurantWalletAddress as `0x${string}`,
        foodyAmount: paymentData.amounts.foody, // 🔥 使用FOODY数量
        usdcEquivalent: paymentData.amounts.usdc, // USDC等值
        orderId: paymentData.orderId,
        restaurantId: paymentData.restaurantId, // 🆕 添加餐厅ID
        restaurantName: paymentData.restaurantInfo?.name || 'Unknown Restaurant'
      };
      
      console.log('🍕 Processing FOODY payment...', paymentRequest);
      
      // 执行真实的FOODY支付 🚀
      const result = await executeFoodyPayment(paymentRequest, config);
      
      if (result.success) {
        // 🚨 立即设置支付成功状态，禁用按钮
        setPaymentSuccessful(true);
        
        // 支付成功 🎉
        const txUrl = getTransactionUrl(result.transactionHash!);
        const shortHash = formatTransactionHash(result.transactionHash!);
        
        alert(`Payment Successful! 🎉

Paid: ${paymentData.amounts.foody.toLocaleString()} FOODY (FOODYE COIN)
     = ( $${paymentData.amounts.usdc.toFixed(2)} USDC )
To: ${paymentData.restaurantInfo?.name}
Wallet: ${paymentData.restaurantWalletAddress}
Order: ${paymentData.orderId}

Transaction: ${shortHash}
View on BaseScan: ${txUrl}`);
        
        // 🚨 用户点击 OK 后才关闭对话框并重置状态
        setShowPaymentConfirm(false);
        setPaymentData(null);
        setPaymentSuccessful(false); // 重置支付成功状态
      } else {
        // 支付失败 ❌
        alert(`Payment Failed ❌\n\n${result.error}`);
      }
      
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed due to unexpected error. Please try again.');
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
      <header className="p-4 flex justify-end items-center">
        <div className="flex items-center gap-4">
          <div className="relative">
            <button
              onClick={() => setShowPortfolio(!showPortfolio)}
              className="text-purple-400 hover:text-purple-300 transition-colors duration-200 font-medium"
            >
              Portfolio
            </button>
            
            {/* Portfolio Dropdown */}
            {showPortfolio && (
              <div className="absolute top-full right-0 mt-2 bg-zinc-900 rounded-xl p-6 shadow-2xl border border-zinc-700 min-w-[320px] z-50">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-purple-400">Diner Portfolio</h2>
                  <button
                    onClick={() => setShowPortfolio(false)}
                    className="text-gray-400 hover:text-white transition-colors duration-200 text-lg"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-4">
                  {/* User Info */}
                  <div className="space-y-3 text-sm">
                    <div>
                      <label className="text-gray-400">Email:</label>
                      <p className="text-white font-medium">{userEmail || 'Not available'}</p>
                    </div>
                    
                    <div>
                      <label className="text-gray-400">Phone:</label>
                      <p className="text-white">{userPhone || 'Not available'}</p>
                    </div>
                    
                    <div>
                      <label className="text-gray-400">Member Since:</label>
                      <p className="text-white">{userCreatedAt ? new Date(userCreatedAt).toLocaleDateString() : 'Not available'}</p>
                    </div>
                  </div>
                  
                  {/* Wallet QR Code */}
                  <div className="border-t border-zinc-700 pt-4">
                    <h3 className="text-sm font-semibold text-purple-400 mb-3">Your Wallet QR Code</h3>
                    {address && (
                      <WalletQRCode walletAddress={address} size={150} />
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
          
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
        </div>
      </header>

      {/* ✅ Main UI */}
      <main className="flex-grow flex flex-col items-center justify-start p-6 space-y-8">
        
        {/* 🆕 FOODY 余额显示 */}
        <div className="w-full max-w-md">
          <FoodyBalance />
        </div>
        
        {/* 🔥 主要功能按钮 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full max-w-4xl">
          <button
            onClick={() => setShowQRScanner(true)}
            className="flex items-center justify-center space-x-2 bg-[#222c4e] hover:bg-[#454b80] text-white px-6 py-4 rounded-lg font-semibold transition-colors"
          >
            <span>📱</span>
            <span>Scan To Pay</span>
          </button>
          
          <button
            onClick={() => setShowFriendPayment(true)}
            className="flex items-center justify-center space-x-2 bg-[#222c4e] hover:bg-[#454b80] text-white px-6 py-4 rounded-lg font-semibold transition-colors"
          >
            <span>💸</span>
            <span>Send to Friend</span>
          </button>
          
          <button
            onClick={() => setShowHistory(true)}
            className="flex items-center justify-center space-x-2 bg-[#222c4e] hover:bg-[#454b80] text-white px-6 py-4 rounded-lg font-semibold transition-colors"
          >
            <span>📊</span>
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
        dinerUuid={userId}
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
                  setPaymentSuccessful(false); // 🚨 重置支付成功状态
                }}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors"
                disabled={isProcessingPayment}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPayment}
                disabled={isProcessingPayment || paymentSuccessful} // 🚨 添加支付成功后禁用
                className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center ${
                  paymentSuccessful 
                    ? 'bg-green-800 text-green-200 cursor-not-allowed' // 🚨 支付成功后的样式
                    : isProcessingPayment
                    ? 'bg-gray-500 text-white cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {paymentSuccessful ? (
                  '✅ Payment Successful' // 🚨 支付成功后显示
                ) : isProcessingPayment ? (
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

      {/* 💸 朋友转账功能 */}
      <FriendPayment
        isOpen={showFriendPayment}
        onClose={() => setShowFriendPayment(false)}
      />
    </div>
  );
}
