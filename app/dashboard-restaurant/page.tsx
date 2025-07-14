'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useFoodyeWallet } from '@/components/Wallet/WalletProvider';
import { supabase } from '@/lib/supabase';

interface RestaurantData {
  restaurant_name: string;
  email: string;
  phone: string;
  address: string;
  wallet: string;
  created_at: string;
}

export default function DashboardRestaurantPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { walletAddress } = useFoodyeWallet();
  
  const [restaurantData, setRestaurantData] = useState<RestaurantData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const welcomeName = searchParams.get('welcome');

  useEffect(() => {
    const fetchRestaurantData = async () => {
      if (!walletAddress) {
        setError('Wallet not connected');
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('restaurants')
          .select('*')
          .eq('wallet', walletAddress)
          .single();

        if (error) {
          console.error('Error fetching restaurant data:', error);
          setError('Failed to load restaurant data');
          return;
        }

        if (!data) {
          setError('Restaurant not found');
          return;
        }

        setRestaurantData(data);
      } catch (err) {
        console.error('Error:', err);
        setError('An error occurred while loading data');
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurantData();
  }, [walletAddress]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading restaurant dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️ Error</div>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => router.push('/register')}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
          >
            Go to Registration
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-purple-900 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">
                {welcomeName ? `Welcome back, ${welcomeName}!` : 'Restaurant Dashboard'}
              </h1>
              <p className="text-blue-200 mt-2">Manage your restaurant on FoodyePay</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-300">Connected Wallet</div>
              <div className="font-mono text-xs bg-gray-800 px-2 py-1 rounded">
                {walletAddress?.slice(0, 8)}...{walletAddress?.slice(-6)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-6">
        {restaurantData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Restaurant Info Card */}
            <div className="bg-zinc-900 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4 text-blue-400">Restaurant Information</h2>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-400">Name:</span>
                  <div className="font-semibold">{restaurantData.restaurant_name}</div>
                </div>
                <div>
                  <span className="text-gray-400">Email:</span>
                  <div className="font-semibold">{restaurantData.email}</div>
                </div>
                <div>
                  <span className="text-gray-400">Phone:</span>
                  <div className="font-semibold">{restaurantData.phone}</div>
                </div>
                <div>
                  <span className="text-gray-400">Address:</span>
                  <div className="font-semibold">{restaurantData.address}</div>
                </div>
                <div>
                  <span className="text-gray-400">Joined:</span>
                  <div className="font-semibold">
                    {new Date(restaurantData.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-zinc-900 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4 text-green-400">Quick Actions</h2>
              <div className="space-y-3">
                <button className="w-full bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded transition-colors">
                  📋 Manage Menu
                </button>
                <button className="w-full bg-green-600 hover:bg-green-700 py-2 px-4 rounded transition-colors">
                  💰 View Transactions
                </button>
                <button className="w-full bg-purple-600 hover:bg-purple-700 py-2 px-4 rounded transition-colors">
                  📊 Analytics
                </button>
                <button className="w-full bg-orange-600 hover:bg-orange-700 py-2 px-4 rounded transition-colors">
                  ⚙️ Settings
                </button>
              </div>
            </div>

            {/* Stats Card */}
            <div className="bg-zinc-900 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4 text-purple-400">Restaurant Stats</h2>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">$0.00</div>
                  <div className="text-sm text-gray-400">Total Revenue</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">0</div>
                  <div className="text-sm text-gray-400">Total Orders</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">0</div>
                  <div className="text-sm text-gray-400">Menu Items</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="mt-8 bg-zinc-900 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-yellow-400">Recent Activity</h2>
          <div className="text-center py-8">
            <div className="text-gray-400 text-lg">📱 Welcome to FoodyePay Restaurant Dashboard!</div>
            <p className="text-gray-500 mt-2">
              Your restaurant management tools will appear here as you start using the platform.
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex gap-4">
          <button
            onClick={() => router.push('/login')}
            className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded transition-colors"
          >
            Switch Account
          </button>
          <button
            onClick={() => {
              localStorage.removeItem('foodye_wallet');
              router.push('/');
            }}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
