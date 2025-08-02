// lib/confirmPayService.ts
// 专门处理食客支付确认记录的服务

import { supabase } from './supabase';

export interface ConfirmPayRecord {
  diner_wallet: string;
  restaurant_id: string;
  restaurant_name: string;
  order_id: string;
  total_amount: number;
  foody_amount: number;
  tx_hash: string;
  gas_used?: string;
  usdc_equivalent: number;
  payment_method: 'FOODY';
}

/**
 * 保存食客支付确认记录到 confirm_and_pay 表
 */
export async function saveConfirmPayRecord(record: ConfirmPayRecord): Promise<boolean> {
  try {
    console.log('💾 saveConfirmPayRecord called with:', JSON.stringify(record, null, 2));

    // 1. 通过钱包地址查找 diner 的 UUID
    console.log('🔍 Looking up diner UUID for wallet:', record.diner_wallet);
    
    const { data: dinerData, error: dinerError } = await supabase
      .from('diners')
      .select('id')
      .eq('wallet_address', record.diner_wallet)
      .single();

    let dinerId: string;

    if (dinerError || !dinerData) {
      console.error('❌ Failed to find diner for wallet:', record.diner_wallet, dinerError);
      
      // 🆕 自动创建 diner 记录，避免支付失败
      console.log('🆕 Auto-creating diner record for confirm_and_pay...');
      const { data: newDiner, error: createError } = await supabase
        .from('diners')
        .insert({
          wallet_address: record.diner_wallet,
          email: `${record.diner_wallet.slice(0, 10)}@temp.foodyepay.com`,
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

      console.log(`✅ Auto-created diner: ${newDiner.id} for wallet: ${record.diner_wallet}`);
      dinerId = newDiner.id;
    } else {
      dinerId = dinerData.id;
      console.log(`✅ Found diner UUID: ${dinerId} for wallet: ${record.diner_wallet}`);
    }

    // 2. 插入到 confirm_and_pay 表
    const confirmPayData = {
      diner_id: dinerId,
      restaurant_id: record.restaurant_id,
      restaurant_name: record.restaurant_name,
      order_id: record.order_id,
      total_amount: record.total_amount,
      foody_amount: record.foody_amount,
      tx_hash: record.tx_hash,
      gas_used: record.gas_used,
      usdc_equivalent: record.usdc_equivalent,
      payment_method: record.payment_method,
      status: 'paid', // 只有 paid 状态
      payment_confirmed_at: new Date().toISOString()
    };

    console.log('📝 Inserting confirm_and_pay record:', confirmPayData);

    const { data: insertData, error: insertError } = await supabase
      .from('confirm_and_pay')
      .insert(confirmPayData)
      .select();

    if (insertError) {
      console.error('❌ Failed to insert confirm_and_pay record:', insertError);
      return false;
    }

    console.log('✅ Successfully saved confirm_and_pay record:', insertData);
    return true;

  } catch (error) {
    console.error('❌ Error in saveConfirmPayRecord:', error);
    return false;
  }
}

/**
 * 获取食客的支付确认记录
 */
export async function getDinerPaymentHistory(walletAddress: string, limit: number = 20) {
  try {
    console.log('🔍 Getting payment history for wallet:', walletAddress);

    // 1. 先获取 diner UUID
    const { data: dinerData, error: dinerError } = await supabase
      .from('diners')
      .select('id')
      .eq('wallet_address', walletAddress)
      .single();

    if (dinerError || !dinerData) {
      console.error('❌ Failed to find diner for wallet:', walletAddress, dinerError);
      return [];
    }

    // 2. 查询 confirm_and_pay 表
    const { data, error } = await supabase
      .from('confirm_and_pay')
      .select('*')
      .eq('diner_id', dinerData.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('❌ Error fetching payment history:', error);
      return [];
    }

    console.log('✅ Payment history fetched:', data);
    return data || [];

  } catch (error) {
    console.error('❌ Error in getDinerPaymentHistory:', error);
    return [];
  }
}

/**
 * 根据 diner UUID 获取支付记录
 */
export async function getPaymentsByDiner(dinerUuid: string, limit: number = 20) {
  try {
    console.log('🔍 Getting payments for diner UUID:', dinerUuid);

    // 查询 confirm_and_pay 表，包含 diner 信息
    const { data, error } = await supabase
      .from('confirm_and_pay')
      .select(`
        *,
        diners:diner_id (
          first_name,
          phone
        )
      `)
      .eq('diner_id', dinerUuid)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('❌ Error fetching payments by diner:', error);
      return [];
    }

    // 格式化数据以匹配 TransactionRecord 接口
    const formattedData = (data || []).map(record => ({
      id: record.id,
      first_name: record.diners?.first_name || 'Unknown',
      phone: record.diners?.phone || 'Unknown',
      foody_amount: record.foody_amount,
      created_at: record.created_at,
      status: record.status
    }));

    console.log('✅ Formatted payments:', formattedData);
    return formattedData;

  } catch (error) {
    console.error('❌ Error in getPaymentsByDiner:', error);
    return [];
  }
}

// 导出服务对象
export const confirmPayService = {
  saveConfirmPayRecord,
  getDinerPaymentHistory,
  getPaymentsByDiner
};
