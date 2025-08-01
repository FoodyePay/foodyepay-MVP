// test-api-state-tax.js
// 测试州代码税率API

const testStateRates = async () => {
  console.log('🧮 Testing State Tax Rate API');
  console.log('='.repeat(40));

  const testCases = [
    { state: 'NY', expected: 8.875 },
    { state: 'DE', expected: 0.00 },
    { state: 'CA', expected: 10.25 },
    { state: 'TX', expected: 8.25 }
  ];

  for (const test of testCases) {
    try {
      // 模拟API调用calculate-tax
      const response = await fetch('http://localhost:3000/api/calculate-tax', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount: 10.00, 
          state: test.state 
        })
      });

      if (response.ok) {
        const data = await response.json();
        const actualRate = (data.tax_rate * 100);
        
        console.log(`\n${test.state}: Expected ${test.expected}%, Got ${actualRate.toFixed(3)}%`);
        console.log(`   Subtotal: $${data.subtotal}`);
        console.log(`   Tax: $${data.tax_amount}`);
        console.log(`   Total: $${data.total_amount}`);
        console.log(`   QR Display: "Tax (${(data.tax_rate * 100).toFixed(3)}%)"`);
        console.log(`   Match: ${Math.abs(actualRate - test.expected) < 0.001 ? '✅' : '❌'}`);
      } else {
        console.log(`${test.state}: API Error - ${response.status}`);
      }
    } catch (error) {
      console.log(`${test.state}: Network Error - ${error.message}`);
    }
  }
};

// 注意：这需要服务器运行才能工作
console.log('⚠️  Note: This test requires the Next.js server to be running (npm run dev)');
console.log('If the server is not running, you will see network errors.\n');

testStateRates();
