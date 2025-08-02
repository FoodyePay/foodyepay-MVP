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
  status: 'delivered' | 'pending' | 'confirmed' | 'preparing' | 'ready' | 'cancelled' | 'completed';
}

/**
 * 保存支付交易记录到数据库 - 匹配实际Supabase数据库结构（带调试）
 */
export async function saveTransactionRecord(transaction: TransactionRecord): Promise<boolean> {
  try {
    console.log('💾 saveTransactionRecord called with:', JSON.stringify(transaction, null, 2));

    // 1. 首先通过钱包地址查找 diner 的 UUID
    console.log('🔍 Looking up diner UUID for wallet:', transaction.diner_wallet);
    
    const { data: dinerData, error: dinerError } = await supabase
      .from('diners')
      .select('id')
      .eq('wallet_address', transaction.diner_wallet)
      .single();

    let dinerId: string;

    if (dinerError || !dinerData) {
      console.error('❌ Failed to find diner for wallet:', transaction.diner_wallet, dinerError);
      
      // 🆕 自动创建 diner 记录，避免支付失败
      console.log('🆕 Auto-creating diner record for payment...');
      const { data: newDiner, error: createError } = await supabase
        .from('diners')
        .insert({
          wallet_address: transaction.diner_wallet,
          email: `${transaction.diner_wallet.slice(0, 10)}@temp.foodyepay.com`,
          first_name: 'Anonymous',
          last_name: 'Diner',
          phone: '000-000-0000',
          role: 'diner'
        })
        .select('id')
        .single();

      if (createError || !newDiner) {
        console.error('❌ Failed to create auto-diner:', createError);
        return false;
      }

      console.log(`✅ Auto-created diner: ${newDiner.id} for wallet: ${transaction.diner_wallet}`);
      dinerId = newDiner.id;
    } else {
      dinerId = dinerData.id;
      console.log(`✅ Found diner UUID: ${dinerId} for wallet: ${transaction.diner_wallet}`);
    }

    // 2. 插入到 orders 表 - 使用实际数据库字段结构
    const orderData = {
      id: transaction.order_id,
      restaurant_id: transaction.restaurant_id,
      diner_id: dinerId, // 使用正确的 diner UUID
      status: 'delivered', // 支付成功后设置为已送达
      order_number: transaction.order_id,
      subtotal: transaction.usdc_equivalent / 1.08875, // 计算税前金额
      tax: transaction.usdc_equivalent * 0.08875 / 1.08875, // 计算税额
      total_amount: transaction.usdc_equivalent,
      foody_amount: transaction.foody_amount, // 🔧 修复: 移除错误的 * 1000000 缩放
      restaurant_name: transaction.restaurant_name,
      tax_rate: 0.08875, // NY州税率
      foody_rate: transaction.foody_amount / transaction.usdc_equivalent, // FOODY汇率
      zip_code: '11365', // 默认邮编，应该从QR码或用户输入获取
      created_at: new Date().toISOString()
    };

    console.log('📝 Inserting to orders table:', JSON.stringify(orderData, null, 2));

    const { data: orderResult, error: orderError } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    console.log('📊 Orders insert result:', { data: orderResult, error: orderError });

    if (orderError) {
      console.error('❌ Error inserting order:', orderError);
      // 如果订单已存在，更新状态
      if (orderError.code === '23505') { // unique_violation
        console.log('🔄 Order exists, updating...');
        const { error: updateError } = await supabase
          .from('orders')
          .update({
            status: transaction.status,
            total_amount: transaction.usdc_equivalent,
            foody_amount: transaction.foody_amount
          })
          .eq('id', transaction.order_id);
        
        console.log('📊 Orders update result:', { error: updateError });
        
        if (updateError) {
          console.error('❌ Error updating order:', updateError);
          return false;
        }
      } else {
        return false;
      }
    }

    // 2. 插入到 payments 表 - 使用实际数据库字段结构
    const paymentData = {
      order_id: transaction.order_id,
      tx_hash: transaction.tx_hash, // 使用正确的字段名 tx_hash 而不是 transaction_hash
      status: transaction.status,
      confirmed_at: new Date().toISOString()
    };

    console.log('📝 Inserting to payments table:', JSON.stringify(paymentData, null, 2));

    const { error: paymentError } = await supabase
      .from('payments')
      .insert(paymentData);

    console.log('📊 Payments insert result:', { error: paymentError });

    if (paymentError) {
      console.error('❌ Error inserting payment:', paymentError);
      return false;
    }

    // 3. 插入到 foody_orders 表 - 根据实际数据库结构
    const foodyOrderData = {
      wallet_address: transaction.diner_wallet,
      amount_usdt: transaction.usdc_equivalent, // 使用amount_usdt字段
      foody_amount: transaction.foody_amount,
      created_at: new Date().toISOString()
    };

    console.log('📝 Inserting to foody_orders table:', JSON.stringify(foodyOrderData, null, 2));

    const { error: foodyError } = await supabase
      .from('foody_orders')
      .insert(foodyOrderData);

    console.log('📊 Foody_orders insert result:', { error: foodyError });

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
 * 获取Diner的交易历史 - 根据实际数据库结构（带调试）
 */
export async function getDinerTransactions(walletAddress: string, limit = 20) {
  try {
    console.log('🔍 getDinerTransactions called with:', { walletAddress, limit });
    
    // 1. 首先通过钱包地址查找 diner 的 UUID
    const { data: dinerData, error: dinerError } = await supabase
      .from('diners')
      .select('id')
      .eq('wallet_address', walletAddress)
      .single();

    if (dinerError || !dinerData) {
      console.error('❌ Failed to find diner for wallet:', walletAddress, dinerError);
      return [];
    }

    const dinerId = dinerData.id;
    console.log(`✅ Found diner UUID: ${dinerId} for wallet: ${walletAddress}`);

    // 2. 使用 diner UUID 查询交易记录
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id,
        restaurant_id,
        total_amount,
        foody_amount,
        status,
        created_at,
        restaurant_name,
        order_number
      `)
      .eq('diner_id', dinerId)
      .order('created_at', { ascending: false })
      .limit(limit);

    console.log('📊 getDinerTransactions query result:', { data, error });

    if (error) {
      console.error('❌ Error fetching diner transactions:', error);
      return [];
    }

    console.log('✅ getDinerTransactions returning:', data?.length || 0, 'records');
    return data || [];
  } catch (error) {
    console.error('💥 Exception in getDinerTransactions:', error);
    return [];
  }
}

/**
 * 获取餐厅的交易历史 - 根据实际数据库结构（带调试）
 */
export async function getRestaurantTransactions(restaurantId: string, limit = 20) {
  try {
    console.log('🔍 getRestaurantTransactions called with:', { restaurantId, limit });
    
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

    console.log('📊 getRestaurantTransactions query result:', { data, error });

    if (error) {
      console.error('❌ Error fetching restaurant transactions:', error);
      return [];
    }

    console.log('✅ getRestaurantTransactions returning:', data?.length || 0, 'records');
    return data || [];
  } catch (error) {
    console.error('💥 Exception in getRestaurantTransactions:', error);
    return [];
  }
}
