'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { supabase } from '@/lib/supabase';

interface Transaction {
  id: string;
  restaurant_name: string;
  amount: number;
  status: string;
  created_at: string;
  tx_hash?: string;
  payment_method: string;
}

interface TransactionHistoryProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TransactionHistory({ isOpen, onClose }: TransactionHistoryProps) {
  const { address } = useAccount();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && address) {
      fetchTransactions();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, address]);

  const fetchTransactions = async () => {
    if (!address) return;
    
    setLoading(true);
    try {
      // 从 orders 表获取交易数据，关联 restaurants 和 payments 表
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id,
          status,
          total_amount,
          created_at,
          restaurants (
            name
          ),
          payments (
            tx_hash,
            status
          )
        `)
        .eq('diner_id', address)
        .order('created_at', { ascending: false })
        .limit(20);

      if (ordersError) {
        console.error('Error fetching orders:', ordersError);
        return;
      }

      // 也获取 FOODY 购买记录
      const { data: foodyData, error: foodyError } = await supabase
        .from('foody_purchases')
        .select('*')
        .eq('wallet_address', address)
        .order('created_at', { ascending: false })
        .limit(10);

      if (foodyError) {
        console.error('Error fetching FOODY purchases:', foodyError);
      }

      // 合并和格式化数据
      const formattedOrders: Transaction[] = (ordersData || []).map(order => {
        const restaurant = order.restaurants as unknown as { name: string } | null;
        const payments = order.payments as unknown as { tx_hash: string }[] | null;
        
        return {
          id: order.id,
          restaurant_name: restaurant?.name || '未知餐厅',
          amount: order.total_amount,
          status: order.status,
          created_at: order.created_at,
          tx_hash: payments?.[0]?.tx_hash,
          payment_method: 'USDC'
        };
      });

      const formattedFoody: Transaction[] = (foodyData || []).map(purchase => ({
        id: purchase.id,
        restaurant_name: 'FOODY 代币购买',
        amount: purchase.foody_amount,
        status: purchase.status,
        created_at: purchase.created_at,
        tx_hash: purchase.tx_hash,
        payment_method: 'ETH'
      }));

      // 合并并按时间排序
      const allTransactions = [...formattedOrders, ...formattedFoody]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setTransactions(allTransactions);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'confirmed':
        return 'text-green-500';
      case 'pending':
        return 'text-yellow-500';
      case 'failed':
      case 'cancelled':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
      case 'confirmed':
        return 'Completed';
      case 'pending':
        return 'Pending';
      case 'failed':
        return 'Failed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Transaction History
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>
        
        <div className="overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Loading...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">No transaction records</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {tx.restaurant_name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {formatDate(tx.created_at)}
                      </p>
                      {tx.tx_hash && (
                        <p className="text-xs text-blue-500 mt-1 font-mono truncate">
                          {tx.tx_hash.slice(0, 20)}...
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {tx.amount} {tx.payment_method}
                      </p>
                      <p className={`text-sm ${getStatusColor(tx.status)}`}>
                        {getStatusText(tx.status)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="mt-4 flex justify-center">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
