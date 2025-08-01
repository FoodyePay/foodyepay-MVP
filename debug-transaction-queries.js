// debug-transaction-queries.js
// 调试交易查询逻辑

console.log('🔍 Debugging Transaction Queries...\n');

// 从成功的支付中获取的实际数据
const actualPaymentData = {
  dinerWallet: '0xF267191Ba8C0D893DB3e85C7e43e1906eE608F3F', // 从diner dashboard看到的地址 
  restaurantId: '785e4179-5dc6-4d46-83d1-3c75c126fbf1',
  restaurantWallet: '0x674302f3714eA8981C98F7688865b02AEBF5E373',
  transactionHash: '0x622335a5714d2718fb3fb279c8462e8b928286e98c520ad1b50ee722334c6221',
  foodyAmount: 18313.138,
  usdcEquivalent: 2.18,
  orderId: '1002'
};

console.log('📱 Actual Payment Data from Screenshots:');
console.log(JSON.stringify(actualPaymentData, null, 2));

console.log('\n🔍 Potential Issues to Check:');
console.log('1. Field name mismatch - diner_id vs diner_wallet vs wallet_address');
console.log('2. Case sensitivity in wallet addresses');
console.log('3. Data type mismatch - string vs uuid');
console.log('4. Missing foreign key relationships');
console.log('5. RLS (Row Level Security) policies blocking queries');

console.log('\n📊 Expected Supabase Query Structure:');
console.log(`
-- For getDinerTransactions:
SELECT * FROM orders 
WHERE diner_id = '${actualPaymentData.dinerWallet}'
ORDER BY created_at DESC;

-- For getRestaurantTransactions:
SELECT * FROM orders 
WHERE restaurant_id = '${actualPaymentData.restaurantId}'
ORDER BY created_at DESC;
`);

console.log('\n⚠️  Debugging Steps:');
console.log('1. Check if records exist in Supabase dashboard');
console.log('2. Verify field names match database schema exactly');
console.log('3. Check wallet address case sensitivity');
console.log('4. Verify restaurant_id format (UUID vs string)');
console.log('5. Check RLS policies allow read access');

console.log('\n🎯 Next Steps:');
console.log('- Add console.log to transactionService functions');
console.log('- Check Supabase dashboard for actual inserted records');
console.log('- Test queries directly in Supabase SQL editor');
