// check-database-records.js
// 检查数据库中是否存在交易记录

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkRecords() {
  console.log('🔍 Checking database records...\n');

  // 检查订单表
  console.log('📊 Checking orders table:');
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  if (ordersError) {
    console.error('❌ Error fetching orders:', ordersError);
  } else {
    console.log(`✅ Found ${orders.length} orders`);
    orders.forEach((order, i) => {
      console.log(`${i + 1}. Order ${order.id}: ${order.restaurant_name || 'N/A'} - $${order.total_amount || 0} (${order.status})`);
    });
  }

  // 检查支付表
  console.log('\n📊 Checking payments table:');
  const { data: payments, error: paymentsError } = await supabase
    .from('payments')
    .select('*')
    .order('confirmed_at', { ascending: false })
    .limit(10);

  if (paymentsError) {
    console.error('❌ Error fetching payments:', paymentsError);
  } else {
    console.log(`✅ Found ${payments.length} payments`);
    payments.forEach((payment, i) => {
      console.log(`${i + 1}. Payment ${payment.order_id}: ${payment.tx_hash} (${payment.status})`);
    });
  }

  // 检查FOODY订单表
  console.log('\n📊 Checking foody_orders table:');
  const { data: foodyOrders, error: foodyError } = await supabase
    .from('foody_orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  if (foodyError) {
    console.error('❌ Error fetching foody_orders:', foodyError);
  } else {
    console.log(`✅ Found ${foodyOrders.length} foody orders`);
    foodyOrders.forEach((order, i) => {
      console.log(`${i + 1}. FOODY Order: ${order.wallet_address} - ${order.foody_amount} FOODY ($${order.amount_usdt})`);
    });
  }

  // 特别检查餐厅ID相关的记录
  console.log('\n🎯 Checking records for restaurant: 785e4179-5dc6-4d46-83d1-3c75c126fbf1');
  const { data: restaurantOrders, error: restError } = await supabase
    .from('orders')
    .select('*')
    .eq('restaurant_id', '785e4179-5dc6-4d46-83d1-3c75c126fbf1');

  if (restError) {
    console.error('❌ Error fetching restaurant orders:', restError);
  } else {
    console.log(`✅ Found ${restaurantOrders.length} orders for this restaurant`);
    restaurantOrders.forEach((order, i) => {
      console.log(`${i + 1}. ${order.id}: ${order.diner_id} -> $${order.total_amount} (${order.status})`);
    });
  }
}

checkRecords().catch(console.error);
