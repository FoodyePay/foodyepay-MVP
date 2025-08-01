// lib/transactionService.ts
// 交易记录服务

import { supabase } from './supabase';

export interface TransactionRecord {
  diner_wallet: string;
  restaurant_id: string;
  restaurant_wallet: string;
  restaurant_name: string;
  order_id: string;
  foody_amount: number;
  usdc_equivalent: number;
  tx_hash: string;
  gas_used?: string;
  payment_method: 'FOODY';
  status: 'completed' | 'pending' | 'failed';
}

/**
 * 保存支付交易记录到数据库 - 匹配实际Supabase数据库结构
 */
export async function saveTransactionRecord(transaction: TransactionRecord): Promise<boolean> {
  try {
    console.log('💾 Saving transaction record:', transaction);

    // 1. 插入到 orders 表 - 根据实际数据库结构
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        id: transaction.order_id,
        restaurant_id: transaction.restaurant_id,
        diner_id: transaction.diner_wallet, // 使用diner_id字段
        status: transaction.status,
        order_number: transaction.order_id,
        subtotal: transaction.usdc_equivalent / 1.08875, // 计算税前金额
        tax: transaction.usdc_equivalent * 0.08875 / 1.08875, // 计算税额
        total_amount: transaction.usdc_equivalent,
        foody_amount: transaction.foody_amount,
        restaurant_name: transaction.restaurant_name,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (orderError) {
      console.error('❌ Error inserting order:', orderError);
      // 如果订单已存在，更新状态
      if (orderError.code === '23505') { // unique_violation
        const { error: updateError } = await supabase
          .from('orders')
          .update({
            status: transaction.status,
            total_amount: transaction.usdc_equivalent,
            foody_amount: transaction.foody_amount
          })
          .eq('id', transaction.order_id);
        
        if (updateError) {
          console.error('❌ Error updating order:', updateError);
          return false;
        }
      } else {
        return false;
      }
    }

    // 2. 插入到 payments 表 - 根据实际数据库结构
    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        order_id: transaction.order_id,
        tx_hash: transaction.tx_hash,
        status: transaction.status,
        confirmed_at: new Date().toISOString()
      });

    if (paymentError) {
      console.error('❌ Error inserting payment:', paymentError);
      return false;
    }

    // 3. 插入到 foody_orders 表 - 根据实际数据库结构
    const { error: foodyError } = await supabase
      .from('foody_orders')
      .insert({
        wallet_address: transaction.diner_wallet,
        amount_usdt: transaction.usdc_equivalent, // 使用amount_usdt字段
        foody_amount: transaction.foody_amount,
        created_at: new Date().toISOString()
      });

    if (foodyError) {
      console.error('⚠️ Warning - Error inserting foody order:', foodyError);
      // 这个表插入失败不影响主要功能
    }

    console.log('✅ Transaction record saved successfully');
    return true;

  } catch (error) {
    console.error('❌ Error saving transaction record:', error);
    return false;
  }
}

/**
 * 获取Diner的交易历史 - 根据实际数据库结构
 */
export async function getDinerTransactions(walletAddress: string, limit = 20) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id,
        restaurant_id,
        total_amount,
        foody_amount,
        status,
        created_at,
        restaurants (
          name
        ),
        payments (
          tx_hash,
          status
        )
      `)
      .eq('diner_id', walletAddress)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching diner transactions:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getDinerTransactions:', error);
    return [];
  }
}

/**
 * 获取餐厅的交易历史 - 根据实际数据库结构
 */
export async function getRestaurantTransactions(restaurantId: string, limit = 20) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id,
        diner_id,
        total_amount,
        foody_amount,
        status,
        created_at,
        payments (
          tx_hash,
          status
        )
      `)
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching restaurant transactions:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getRestaurantTransactions:', error);
    return [];
  }
}
