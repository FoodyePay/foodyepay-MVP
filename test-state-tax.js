// test-state-tax.js
// 测试新的州税率系统

import { getTaxRateByState, calculateTax, getAllStateTaxRates, getStateTaxInfo } from './lib/taxService.js';

async function testStateTaxSystem() {
  console.log('🧮 Testing New State-based Tax System\n');

  // 测试几个主要州
  const testStates = ['NY', 'CA', 'TX', 'FL', 'OR', 'NH', 'DE'];
  
  console.log('📊 State Tax Rates:');
  console.log('==================');
  
  for (const state of testStates) {
    try {
      const taxInfo = getStateTaxInfo(state);
      const taxRate = await getTaxRateByState(state);
      
      console.log(`${state}: ${taxInfo.percentage} ${taxInfo.hasNoTax ? '(No Tax!)' : ''}`);
      
      // 测试税费计算
      const subtotal = 100.00;
      const calculation = await calculateTax(subtotal, state);
      console.log(`  $${subtotal} → Tax: $${calculation.tax_amount} → Total: $${calculation.total_amount}`);
      console.log('');
      
    } catch (error) {
      console.error(`Error testing ${state}:`, error.message);
    }
  }

  // 测试QR码中使用的NY州
  console.log('🏪 Testing Restaurant Scenario (NY):');
  console.log('===================================');
  
  const restaurant = {
    name: "Ken Canton CUISINE INC.",
    state: "NY",
    subtotal: 10.00
  };
  
  const nyCalculation = await calculateTax(restaurant.subtotal, restaurant.state);
  console.log(`Restaurant: ${restaurant.name}`);
  console.log(`State: ${restaurant.state}`);
  console.log(`Subtotal: $${restaurant.subtotal}`);
  console.log(`Tax (${(nyCalculation.tax_rate * 100).toFixed(2)}%): $${nyCalculation.tax_amount}`);
  console.log(`Total: $${nyCalculation.total_amount}`);
  
  // 验证与QR码数据一致性
  const expectedTax = 0.73; // 来自QR码
  const calculatedTax = nyCalculation.tax_amount;
  console.log(`\n✅ Tax Calculation Verification:`);
  console.log(`Expected (from QR): $${expectedTax}`);
  console.log(`Calculated: $${calculatedTax}`);
  console.log(`Match: ${Math.abs(calculatedTax - expectedTax) < 0.01 ? '✅ YES' : '❌ NO'}`);

  // 显示所有0%税率的州
  console.log('\n🆓 No-Tax States:');
  console.log('================');
  const allRates = getAllStateTaxRates();
  const noTaxStates = Object.entries(allRates)
    .filter(([state, rate]) => rate === 0)
    .map(([state, rate]) => state);
  
  console.log(`States with 0% food tax: ${noTaxStates.join(', ')}`);
  
  // 显示最高税率的州
  console.log('\n📈 Highest Tax States:');
  console.log('=====================');
  const sortedRates = Object.entries(allRates)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);
  
  sortedRates.forEach(([state, rate]) => {
    console.log(`${state}: ${(rate * 100).toFixed(2)}%`);
  });
}

// 运行测试
testStateTaxSystem().catch(console.error);
