// test-required-order-id.js
// 测试Order ID作为必填字段的验证逻辑

console.log('🧪 Testing Required Order ID Validation');
console.log('='.repeat(50));

// 模拟QR生成验证逻辑
function validateQRGeneration(amount, orderId) {
  console.log(`\n🔍 Testing: Amount="${amount}", OrderID="${orderId}"`);
  
  // 验证必填字段
  if (!amount || !orderId) {
    const missing = [];
    if (!amount) missing.push('Amount');
    if (!orderId) missing.push('Order ID');
    
    console.log(`❌ Validation Failed: Missing ${missing.join(' and ')}`);
    return {
      valid: false,
      error: `Please enter both amount and order ID - both are required`,
      missing: missing
    };
  }

  const parsedAmount = parseFloat(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    console.log(`❌ Validation Failed: Invalid amount`);
    return {
      valid: false,
      error: 'Please enter a valid amount greater than 0'
    };
  }

  console.log(`✅ Validation Passed: Ready to generate QR code`);
  return {
    valid: true,
    data: {
      amount: parsedAmount,
      orderId: orderId,
      qrData: {
        restaurantId: 'test-restaurant-123',
        orderId: orderId, // 不再使用默认值 'general'
        amounts: {
          usdc: parsedAmount,
          subtotal: parsedAmount - (parsedAmount * 0.08875)
        }
      }
    }
  };
}

// 测试用例
const testCases = [
  { amount: '', orderId: '', expected: 'fail', reason: 'Both missing' },
  { amount: '10', orderId: '', expected: 'fail', reason: 'Order ID missing' },
  { amount: '', orderId: 'ord-123', expected: 'fail', reason: 'Amount missing' },
  { amount: '0', orderId: 'ord-123', expected: 'fail', reason: 'Zero amount' },
  { amount: '-5', orderId: 'ord-123', expected: 'fail', reason: 'Negative amount' },
  { amount: 'abc', orderId: 'ord-123', expected: 'fail', reason: 'Invalid amount' },
  { amount: '10.50', orderId: 'ord-456', expected: 'pass', reason: 'Valid input' },
  { amount: '25', orderId: 'TABLE-5-ORDER-789', expected: 'pass', reason: 'Valid with complex order ID' }
];

console.log('\n📋 Running Test Cases:');
let passedTests = 0;
let totalTests = testCases.length;

for (const testCase of testCases) {
  const result = validateQRGeneration(testCase.amount, testCase.orderId);
  const actualResult = result.valid ? 'pass' : 'fail';
  const testPassed = actualResult === testCase.expected;
  
  console.log(`\n${testPassed ? '✅' : '❌'} Test: ${testCase.reason}`);
  console.log(`   Input: Amount="${testCase.amount}", OrderID="${testCase.orderId}"`);
  console.log(`   Expected: ${testCase.expected}, Got: ${actualResult}`);
  
  if (result.valid) {
    console.log(`   Generated Order ID: ${result.data.orderId}`);
  } else {
    console.log(`   Error: ${result.error}`);
  }
  
  if (testPassed) passedTests++;
}

console.log(`\n📊 Test Results: ${passedTests}/${totalTests} passed`);

console.log('\n🎯 Key Changes Summary:');
console.log('• Order ID is now required (marked with *)');
console.log('• Amount remains required');
console.log('• Table Number stays optional');
console.log('• No more "general" default order IDs');
console.log('• Button disabled until both required fields filled');
console.log('• Clear validation messages for missing fields');

console.log('\n💡 Business Benefits:');
console.log('• Better order tracking and management');
console.log('• Unique identification for each payment QR');
console.log('• Improved customer service (specific order lookup)');
console.log('• Cleaner data without generic placeholders');
