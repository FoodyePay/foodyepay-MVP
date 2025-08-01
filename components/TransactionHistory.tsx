'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { getDinerTransactions } from '@/lib/transactionService';

interface Transaction {
  id: string;
  restaurant_name: string;
  amount: number;
  status: string;
  created_at: string;
  tx_hash?: string;
  payment_method: string;
  foody_amount?: number; // 添加FOODY数量字段
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
      console.log('🔍 Fetching transactions for:', address);
      
      // 使用新的交易服务
      const transactionData = await getDinerTransactions(address, 20);
      
      console.log('📊 Fetched transaction data:', transactionData);
      
      // 格式化数据 - 匹配实际数据库结构
      const formattedTransactions: Transaction[] = transactionData.map((item: {
        id: any;
        restaurant_id: any;
        total_amount: any;
        foody_amount: any;
        status: any;
        created_at: any;
        restaurants: { name: any }[];
        payments: {
          tx_hash: any;
          status: any;
        }[];
      }) => {
        const restaurant = item.restaurants?.[0];
        const payment = item.payments?.[0];
        
        return {
          id: item.id,
          restaurant_name: restaurant?.name || '未知餐厅',
          amount: item.total_amount || 0,
          status: item.status,
          created_at: item.created_at,
          tx_hash: payment?.tx_hash,
          payment_method: 'FOODY',
          foody_amount: item.foody_amount || 0
        };
      });

      console.log('✅ Formatted transactions:', formattedTransactions);
      setTransactions(formattedTransactions);
      
    } catch (error) {
      console.error('❌ Error fetching transactions:', error);
      setTransactions([]);
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
