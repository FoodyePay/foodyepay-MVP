'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { supabase } from '@/lib/supabase';
import { QRGenerator } from '@/components/QRGenerator';
import { OrderManagement } from '@/components/OrderManagement';
import { FoodyBalance } from '@/components/FoodyBalance';

interface Restaurant {
  id: string;
  wallet_address: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  zip_code: string;
  city: string;
  state: string;
  created_at: string;
}

export default function RestaurantDashboard() {
  const router = useRouter();
  const { address } = useAccount();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  
  // MVP Modal states - 只保留核心功能
  const [showQRGenerator, setShowQRGenerator] = useState(false);
  const [showOrderManagement, setShowOrderManagement] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      if (!address) {
        router.push('/');
        return;
      }

      try {
        const { data, error } = await supabase
          .from('restaurants')
          .select('*')
          .eq('wallet_address', address)
          .single();

        if (error || !data) {
          console.warn('Restaurant not found, redirecting to register');
          router.push('/register');
          return;
        }

        setRestaurant(data);
      } catch (err) {
        console.error('Error fetching restaurant data:', err);
        router.push('/register');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [address, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p>Loading restaurant dashboard...</p>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Welcome Banner */}
      <div className="bg-[#1e40af] text-white p-4 text-center border-b border-zinc-800">
        <h1 className="text-2xl font-bold">
          Welcome to FoodyePay, {restaurant.name.split(' ')[0]}!
        </h1>
        <p className="text-blue-100 mt-1">Manage your restaurant&apos;s Web3 payments</p>
        <p className="text-xs text-blue-200 mt-2 font-mono">
          Restaurant ID: {restaurant.id}
        </p>
      </div>

      {/* Header */}
      <header className="bg-zinc-900 border-b border-zinc-800 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-purple-400">🍽️ {restaurant.name}</h1>
            <p className="text-sm text-gray-400">Restaurant Dashboard</p>
          </div>
          
          {/* Professional Wallet Component */}
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        
        {/* FOODY 余额显示 */}
        <div className="w-full max-w-md mx-auto mb-8">
          <FoodyBalance />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Restaurant Info Card */}
          <div className="lg:col-span-1">
            <div className="bg-zinc-900 rounded-xl p-6 space-y-4">
              <h2 className="text-xl font-semibold text-purple-400 mb-4">Restaurant Info</h2>
              
              <div className="space-y-3 text-sm">
                <div>
                  <label className="text-gray-400">Name:</label>
                  <p className="text-white font-medium">{restaurant.name}</p>
                </div>
                
                <div>
                  <label className="text-gray-400">Address:</label>
                  <p className="text-white">{restaurant.address}</p>
                </div>
                
                <div>
                  <label className="text-gray-400">Email:</label>
                  <p className="text-white">{restaurant.email}</p>
                </div>
                
                <div>
                  <label className="text-gray-400">Phone:</label>
                  <p className="text-white">{restaurant.phone}</p>
                </div>
                
                <div>
                  <label className="text-gray-400">Member Since:</label>
                  <p className="text-white">{new Date(restaurant.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions - MVP 核心功能 */}
          <div className="lg:col-span-2">
            <div className="bg-zinc-900 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-purple-400 mb-6">Quick Actions</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Generate QR Code */}
                <button 
                  onClick={() => setShowQRGenerator(true)}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 p-6 rounded-lg transition-all duration-200 text-left group"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">📱</span>
                    <div>
                      <h3 className="font-semibold text-white group-hover:text-purple-100">Generate QR Code</h3>
                      <p className="text-sm text-purple-200">Create payment QR codes for orders</p>
                    </div>
                  </div>
                </button>

                {/* Payment Management */}
                <button 
                  onClick={() => setShowOrderManagement(true)}
                  className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 p-6 rounded-lg transition-all duration-200 text-left group"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">💳</span>
                    <div>
                      <h3 className="font-semibold text-white group-hover:text-yellow-100">Payment Management</h3>
                      <p className="text-sm text-yellow-200">View and process payment transactions</p>
                    </div>
                  </div>
                </button>

              </div>
            </div>
          </div>
        </div>

        {/* MVP: 极简化设计，不显示统计数据等冗余内容 */}

      </main>

      {/* Modals - 只保留核心功能的模态框 */}
      {showQRGenerator && (
        <QRGenerator
          isOpen={showQRGenerator}
          onClose={() => setShowQRGenerator(false)}
          restaurantId={restaurant?.id || ''}
          restaurantWalletAddress={restaurant?.wallet_address || ''}
          restaurantZipCode={restaurant?.zip_code || '10001'}
          restaurantInfo={{
            name: restaurant?.name || 'Restaurant',
            address: restaurant?.address || 'Address not available',
            email: restaurant?.email || 'Email not available',
            phone: restaurant?.phone || 'Phone not available',
            city: restaurant?.city || '',
            state: restaurant?.state || 'NY'
          }}
        />
      )}

      {showOrderManagement && (
        <OrderManagement
          isOpen={showOrderManagement}
          onClose={() => setShowOrderManagement(false)}
          restaurantId={restaurant?.id || ''}
        />
      )}

    </div>
  );
}
