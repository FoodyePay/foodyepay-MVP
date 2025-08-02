'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { supabase } from '@/lib/supabase';

interface Restaurant {
  id: string;
  wallet_address: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  created_at: string;
}

export default function RestaurantDashboard() {
  const router = useRouter();
  const { address } = useAccount();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);

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
      {/* 🎉 Welcome Banner */}
      <div className="bg-[#202541] text-white p-4 text-center border-b border-zinc-800">
        <h1 className="text-2xl font-bold">
          Welcome to FoodyePay, {restaurant.name.split(' ')[0]}!
        </h1>
        <p className="text-blue-100 mt-1">Your restaurant management dashboard</p>
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
          <div className="text-right">
            <p className="text-sm text-gray-400">Connected Wallet</p>
            <p className="font-mono text-xs text-green-400">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
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
                
                {/* Menu Management */}
                <button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 p-6 rounded-lg transition-all duration-200 text-left group">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">📝</span>
                    <div>
                      <h3 className="font-semibold text-white group-hover:text-purple-100">Manage Menu</h3>
                      <p className="text-sm text-purple-200">Add, edit, or remove menu items</p>
                    </div>
                  </div>
                </button>

                {/* Orders */}
                <button className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 p-6 rounded-lg transition-all duration-200 text-left group">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">📋</span>
                    <div>
                      <h3 className="font-semibold text-white group-hover:text-green-100">View Orders</h3>
                      <p className="text-sm text-green-200">Check incoming orders and status</p>
                    </div>
                  </div>
                </button>

                {/* Payments */}
                <button className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 p-6 rounded-lg transition-all duration-200 text-left group">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">💰</span>
                    <div>
                      <h3 className="font-semibold text-white group-hover:text-yellow-100">Payment History</h3>
                      <p className="text-sm text-yellow-200">View all cryptocurrency payments</p>
                    </div>
                  </div>
                </button>

                {/* Analytics */}
                <button className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 p-6 rounded-lg transition-all duration-200 text-left group">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">📊</span>
                    <div>
                      <h3 className="font-semibold text-white group-hover:text-pink-100">Analytics</h3>
                      <p className="text-sm text-pink-200">Sales reports and insights</p>
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
            <div className="text-2xl font-bold text-purple-400">0</div>
            <div className="text-sm text-gray-400">Menu Items</div>
          </div>
          
          <div className="bg-zinc-900 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400">0</div>
            <div className="text-sm text-gray-400">Orders Today</div>
          </div>
          
          <div className="bg-zinc-900 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">0 ETH</div>
            <div className="text-sm text-gray-400">Today&apos;s Revenue</div>
          </div>
          
          <div className="bg-zinc-900 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">⭐ 0.0</div>
            <div className="text-sm text-gray-400">Rating</div>
          </div>
          
        </div>

        {/* Coming Soon Features */}
        <div className="mt-6 bg-zinc-900 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-purple-400 mb-4">🚀 Coming Soon</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            
            <div className="bg-zinc-800 rounded-lg p-4">
              <div className="text-purple-400 font-semibold mb-2">� Payment Management</div>
              <p className="text-gray-400">Real-time payment tracking and transaction dashboard</p>
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
    </div>
  );
}
