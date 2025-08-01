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
import { MenuManagement } from '@/components/MenuManagement';
import { FinancialAnalytics } from '@/components/FinancialAnalytics';
import { FoodyBalance } from '@/components/FoodyBalance';

interface Restaurant {
  id: string;
  wallet_address: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  zip_code: string; // 新增邮政编码字段
  city: string;
  state: string;
  created_at: string;
}

export default function RestaurantDashboard() {
  const router = useRouter();
  const { address } = useAccount();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  
  // 🆕 Modal states
  const [showQRGenerator, setShowQRGenerator] = useState(false);
  const [showOrderManagement, setShowOrderManagement] = useState(false);
  const [showMenuManagement, setShowMenuManagement] = useState(false);
  const [showFinancialAnalytics, setShowFinancialAnalytics] = useState(false);
  
  // 🆕 Dashboard stats
  const [dashboardStats, setDashboardStats] = useState({
    menuItems: 0,
    todayOrders: 0,
    todayRevenue: 0,
    rating: 0
  });

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
        
        // 🆕 Fetch dashboard statistics
        await fetchDashboardStats(data.id);
      } catch (err) {
        console.error('Error fetching restaurant data:', err);
        router.push('/register');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [address, router]);

  // 🆕 Fetch dashboard statistics
  const fetchDashboardStats = async (restaurantId: string) => {
    try {
      // Fetch menu items count
      const { count: menuCount } = await supabase
        .from('menu_items')
        .select('*', { count: 'exact', head: true })
        .eq('restaurant_id', restaurantId);

      // Fetch today's orders
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const { data: todayOrdersData, count: todayOrdersCount } = await supabase
        .from('orders')
        .select('total_amount', { count: 'exact' })
        .eq('restaurant_id', restaurantId)
        .gte('created_at', todayStart.toISOString());

      const todayRevenue = todayOrdersData?.reduce((sum, order) => sum + order.total_amount, 0) || 0;

      setDashboardStats({
        menuItems: menuCount || 0,
        todayOrders: todayOrdersCount || 0,
        todayRevenue: todayRevenue,
        rating: 4.5 // TODO: Implement real rating system
      });

    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

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
          
          {/* 🆕 Professional Wallet Component */}
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
        
        {/* 🆕 FOODY 余额显示 */}
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

          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <div className="bg-zinc-900 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-purple-400 mb-6">Quick Actions</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* 🆕 Generate QR Code */}
                <button 
                  onClick={() => setShowQRGenerator(true)}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 p-6 rounded-lg transition-all duration-200 text-left group"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">�</span>
                    <div>
                      <h3 className="font-semibold text-white group-hover:text-purple-100">Generate QR Code</h3>
                      <p className="text-sm text-purple-200">Create payment QR codes for orders</p>
                    </div>
                  </div>
                </button>

                {/* 🆕 Menu Management */}
                <button 
                  onClick={() => setShowMenuManagement(true)}
                  className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 p-6 rounded-lg transition-all duration-200 text-left group"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">�</span>
                    <div>
                      <h3 className="font-semibold text-white group-hover:text-green-100">Manage Menu</h3>
                      <p className="text-sm text-green-200">Add, edit, or remove menu items</p>
                    </div>
                  </div>
                </button>

                {/* 🆕 Orders Management */}
                <button 
                  onClick={() => setShowOrderManagement(true)}
                  className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 p-6 rounded-lg transition-all duration-200 text-left group"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">�</span>
                    <div>
                      <h3 className="font-semibold text-white group-hover:text-yellow-100">Manage Orders</h3>
                      <p className="text-sm text-yellow-200">View and process incoming orders</p>
                    </div>
                  </div>
                </button>

                {/* 🆕 Financial Analytics */}
                <button 
                  onClick={() => setShowFinancialAnalytics(true)}
                  className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 p-6 rounded-lg transition-all duration-200 text-left group"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">📊</span>
                    <div>
                      <h3 className="font-semibold text-white group-hover:text-pink-100">Financial Analytics</h3>
                      <p className="text-sm text-pink-200">Revenue reports and insights</p>
                    </div>
                  </div>
                </button>

              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          
          <div className="bg-zinc-900 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">{dashboardStats.menuItems}</div>
            <div className="text-sm text-gray-400">Menu Items</div>
          </div>
          
          <div className="bg-zinc-900 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400">{dashboardStats.todayOrders}</div>
            <div className="text-sm text-gray-400">Orders Today</div>
          </div>
          
          <div className="bg-zinc-900 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">${dashboardStats.todayRevenue.toFixed(2)}</div>
            <div className="text-sm text-gray-400">Today&apos;s Revenue</div>
          </div>
          
          <div className="bg-zinc-900 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">⭐ {dashboardStats.rating.toFixed(1)}</div>
            <div className="text-sm text-gray-400">Rating</div>
          </div>
          
        </div>

        {/* Coming Soon Features */}
        <div className="mt-6 bg-zinc-900 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-purple-400 mb-4">🚀 Coming Soon</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            
            <div className="bg-zinc-800 rounded-lg p-4">
              <div className="text-purple-400 font-semibold mb-2">🍽️ Table Management</div>
              <p className="text-gray-400">Manage table reservations and seating</p>
            </div>
            
            <div className="bg-zinc-800 rounded-lg p-4">
              <div className="text-green-400 font-semibold mb-2">🎯 Smart Contracts</div>
              <p className="text-gray-400">Automated payments and escrow protection</p>
            </div>
            
            <div className="bg-zinc-800 rounded-lg p-4">
              <div className="text-blue-400 font-semibold mb-2">📱 Mobile App</div>
              <p className="text-gray-400">Dedicated restaurant management app</p>
            </div>
            
          </div>
        </div>

      </main>

      {/* 🆕 Modals */}
      {showQRGenerator && (
        <QRGenerator
          isOpen={showQRGenerator}
          onClose={() => setShowQRGenerator(false)}
          restaurantId={restaurant?.id || ''}
          restaurantWalletAddress={restaurant?.wallet_address || ''} // 🆕 传递钱包地址
          restaurantZipCode={restaurant?.zip_code || '10001'} // 向后兼容：ZIP code备选方案
          restaurantInfo={{
            name: restaurant?.name || 'Restaurant',
            address: restaurant?.address || 'Address not available',
            email: restaurant?.email || 'Email not available',
            phone: restaurant?.phone || 'Phone not available',
            city: restaurant?.city || '',
            state: restaurant?.state || 'NY' // 优先使用州代码进行税率计算
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

      {showMenuManagement && (
        <MenuManagement
          isOpen={showMenuManagement}
          onClose={() => setShowMenuManagement(false)}
          restaurantId={restaurant?.id || ''}
        />
      )}

      {showFinancialAnalytics && (
        <FinancialAnalytics
          isOpen={showFinancialAnalytics}
          onClose={() => setShowFinancialAnalytics(false)}
          restaurantId={restaurant?.id || ''}
        />
      )}

    </div>
  );
}
