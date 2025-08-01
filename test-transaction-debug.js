// test-transaction-debug.js
// 手动测试交易查询函数

console.log('🧪 Manual Transaction Query Test');

// 模拟调用查询函数
const testDinerAddress = '0xF267191Ba8C0D893DB3e85C7e43e1906eE608F3F';  // 从支付截图获取
const testRestaurantId = '785e4179-5dc6-4d46-83d1-3c75c126fbf1';  // 从dashboard获取

console.log('\n📱 Test Parameters:');
console.log('Diner Address:', testDinerAddress);
console.log('Restaurant ID:', testRestaurantId);

console.log('\n🎯 Expected Queries:');
console.log('1. getDinerTransactions will query: SELECT * FROM orders WHERE diner_id = \'' + testDinerAddress + '\'');
console.log('2. getRestaurantTransactions will query: SELECT * FROM orders WHERE restaurant_id = \'' + testRestaurantId + '\'');

console.log('\n⚠️ Potential Issues:');
console.log('- Case sensitivity: wallet addresses might be stored in different case');
console.log('- Field name mismatch: diner_id vs diner_wallet vs wallet_address');
console.log('- UUID format: restaurant_id might need to be formatted as UUID');
console.log('- RLS policies: Row Level Security might block queries');
console.log('- Relations: restaurants table join might fail');

console.log('\n🔍 Debugging Steps:');
console.log('1. Open browser DevTools Console');
console.log('2. Go to Restaurant Dashboard -> Financial Analytics');
console.log('3. Check console for query results');
console.log('4. Go to Diner Dashboard -> Transaction History');
console.log('5. Check console for query results');

console.log('\n📊 Expected Console Output:');
console.log('🔍 getRestaurantTransactions called with: { restaurantId: "785e4179-5dc6-4d46-83d1-3c75c126fbf1", limit: 50 }');
console.log('📊 getRestaurantTransactions query result: { data: [...], error: null }');
console.log('✅ getRestaurantTransactions returning: X records');

console.log('\n🚀 Ready for browser testing!');
