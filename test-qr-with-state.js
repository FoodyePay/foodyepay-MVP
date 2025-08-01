// test-qr-with-state.js
// 测试基于州代码的QR码生成

// 直接使用州税率表而不是导入TypeScript模块
const PREPARED_FOOD_TAX_RATES = {
  'AL': 0.04,    // Alabama: 4.00%
  'AK': 0.00,    // Alaska: 0.00%
  'AZ': 0.0560,  // Arizona: Up to 5.60%
  'AR': 0.1125,  // Arkansas: Up to 11.25%
  'CA': 0.1025,  // California: Up to 10.25%
  'CO': 0.08,    // Colorado: Up to 8.00%
  'CT': 0.0635,  // Connecticut: 6.35%
  'DE': 0.00,    // Delaware: 0.00%
  'FL': 0.08,    // Florida: Up to 8.00%
  'GA': 0.08,    // Georgia: Up to 8.00%
  'HI': 0.04,    // Hawaii: 4.00%
  'ID': 0.07,    // Idaho: Up to 7.00%
  'IL': 0.1025,  // Illinois: Up to 10.25%
  'IN': 0.07,    // Indiana: 7.00%
  'IA': 0.07,    // Iowa: Up to 7.00%
  'KS': 0.0865,  // Kansas: Up to 8.65%
  'KY': 0.06,    // Kentucky: 6.00%
  'LA': 0.1145,  // Louisiana: Up to 11.45%
  'ME': 0.055,   // Maine: 5.50%
  'MD': 0.06,    // Maryland: 6.00%
  'MA': 0.0625,  // Massachusetts: 6.25%
  'MI': 0.06,    // Michigan: 6.00%
  'MN': 0.0775,  // Minnesota: Up to 7.75%
  'MS': 0.08,    // Mississippi: Up to 8.00%
  'MO': 0.0863,  // Missouri: Up to 8.63%
  'MT': 0.00,    // Montana: 0.00% (Varies → use 0)
  'NE': 0.075,   // Nebraska: Up to 7.50%
  'NV': 0.0825,  // Nevada: Up to 8.25%
  'NH': 0.00,    // New Hampshire: 0.00%
  'NJ': 0.06625, // New Jersey: 6.625%
  'NM': 0.0813,  // New Mexico: Up to 8.13%
  'NY': 0.08875, // New York: Up to 8.875%
  'NC': 0.0775,  // North Carolina: Up to 7.75%
  'ND': 0.075,   // North Dakota: Up to 7.50%
  'OH': 0.08,    // Ohio: Up to 8.00%
  'OK': 0.115,   // Oklahoma: Up to 11.50%
  'OR': 0.00,    // Oregon: 0.00%
  'PA': 0.08,    // Pennsylvania: Up to 8.00%
  'RI': 0.08,    // Rhode Island: 8.00%
  'SC': 0.09,    // South Carolina: Up to 9.00%
  'SD': 0.062,   // South Dakota: Up to 6.20%
  'TN': 0.0975,  // Tennessee: Up to 9.75%
  'TX': 0.0825,  // Texas: Up to 8.25%
  'UT': 0.0905,  // Utah: Up to 9.05%
  'VT': 0.10,    // Vermont: Up to 10.00%
  'VA': 0.07,    // Virginia: Up to 7.00%
  'WA': 0.106,   // Washington: Up to 10.60%
  'WV': 0.07,    // West Virginia: Up to 7.00%
  'WI': 0.056,   // Wisconsin: Up to 5.60%
  'WY': 0.06,    // Wyoming: Up to 6.00%
};

function getTaxRateByState(state) {
  const stateCode = state.toUpperCase();
  const taxRate = PREPARED_FOOD_TAX_RATES[stateCode] || 0.0725;
  
  return {
    rate: taxRate,
    total_rate: taxRate
  };
}

function calculateTax(subtotal, state, taxRate) {
  const tax_amount = subtotal * taxRate.total_rate;
  const total_amount = subtotal + tax_amount;
  
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    tax_amount: Math.round(tax_amount * 100) / 100,
    total_amount: Math.round(total_amount * 100) / 100,
    tax_rate: taxRate.total_rate,
    state: state.toUpperCase()
  };
}

async function testStateBasedQRGeneration() {
  console.log('🏪 Testing State-Based QR Code Generation');
  console.log('=' .repeat(50));

  const testStates = [
    { code: 'NY', name: 'New York', expectedRate: 8.875 },
    { code: 'CA', name: 'California', expectedRate: 10.25 },
    { code: 'TX', name: 'Texas', expectedRate: 8.25 },
    { code: 'FL', name: 'Florida', expectedRate: 8.00 },
    { code: 'DE', name: 'Delaware', expectedRate: 0.00 },
  ];

  const testAmount = 10.00;

  for (const state of testStates) {
    console.log(`\n🍽️ Testing ${state.name} (${state.code}):`);
    
    try {
      // 获取税率
      const taxRate = getTaxRateByState(state.code);
      const taxCalculation = calculateTax(testAmount, state.code, taxRate);
      
      const actualRate = (taxRate.total_rate * 100);
      console.log(`   Expected Rate: ${state.expectedRate}%`);
      console.log(`   Actual Rate: ${actualRate.toFixed(3)}%`);
      console.log(`   Match: ${Math.abs(actualRate - state.expectedRate) < 0.001 ? '✅' : '❌'}`);
      
      if (Math.abs(actualRate - state.expectedRate) >= 0.001) {
        console.log(`   ⚠️  Rate mismatch! Expected ${state.expectedRate}% but got ${actualRate.toFixed(3)}%`);
      }
      // QR码数据模拟
      const qrData = {
        restaurantId: 'test-restaurant',
        orderId: 'test-order',
        amounts: {
          usdc: taxCalculation.total_amount,
          subtotal: taxCalculation.subtotal,
          tax: taxCalculation.tax_amount
        },
        taxInfo: {
          rate: taxCalculation.tax_rate,
          state: taxCalculation.state
        },
        timestamp: Date.now()
      };
      
      console.log(`   QR Tax Display: "Tax (${(taxCalculation.tax_rate * 100).toFixed(3)}%)"`);
      console.log(`   QR Title: "Payment"`);
      console.log(`   Subtotal: $${taxCalculation.subtotal.toFixed(2)}`);
      console.log(`   Tax: $${taxCalculation.tax_amount.toFixed(2)}`);
      console.log(`   Total: $${taxCalculation.total_amount.toFixed(2)}`);
      
    } catch (error) {
      console.error(`   Error: ${error.message}`);
    }
  }

  // 特别测试NY的8.875%显示
  console.log('\n🗽 Special NY Test:');
  const nyTaxRate = getTaxRateByState('NY');
  const nyCalc = calculateTax(10.00, 'NY', nyTaxRate);
  
  console.log(`NY Tax Rate: ${(nyCalc.tax_rate * 100).toFixed(3)}% (should be 8.875%)`);
  console.log(`NY Tax Amount: $${nyCalc.tax_amount.toFixed(2)} (should be $0.89)`);
  console.log(`Display Text: "Tax (${(nyCalc.tax_rate * 100).toFixed(3)}%)"`);
  
  const isCorrect = Math.abs((nyCalc.tax_rate * 100) - 8.875) < 0.001;
  console.log(`✅ NY Test Result: ${isCorrect ? 'PASS' : 'FAIL'}`);
}

testStateBasedQRGeneration().catch(console.error);
