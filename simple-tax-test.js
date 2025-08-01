// simple-tax-test.js
// 简单的税率测试

// 直接复制税率表进行测试
const PREPARED_FOOD_TAX_RATES = {
  // A-F States
  'AL': 0.04,    // Alabama: 4.00%
  'AK': 0.00,    // Alaska: 0.00%
  'AZ': 0.0560,  // Arizona: Up to 5.60%
  'AR': 0.1125,  // Arkansas: Up to 11.25%
  'CA': 0.1025,  // California: Up to 10.25%
  'CO': 0.08,    // Colorado: Up to 8.00%
  'CT': 0.0635,  // Connecticut: 6.35%
  'DE': 0.00,    // Delaware: 0.00%
  'FL': 0.08,    // Florida: Up to 8.00%
  
  // G-M States
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
  
  // N-S States
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
  
  // T-W States
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

function calculateSimpleTax(subtotal, state) {
  const stateCode = state.toUpperCase();
  const rate = PREPARED_FOOD_TAX_RATES[stateCode];
  
  // 调试信息
  console.log(`Debug: Looking up ${stateCode}, found rate: ${rate}`);
  
  if (rate === undefined) {
    console.log(`Warning: State ${stateCode} not found, using default 7.25%`);
    rate = 0.0725;
  }
  
  const tax = subtotal * rate;
  const total = subtotal + tax;
  
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    total: Math.round(total * 100) / 100,
    rate: rate,
    percentage: `${(rate * 100).toFixed(2)}%`
  };
}

console.log('🧮 Testing New State-based Tax System\n');

// 测试几个主要州
const testStates = ['NY', 'CA', 'TX', 'FL', 'OR', 'NH', 'DE', 'OK', 'VT'];

console.log('📊 State Tax Rates:');
console.log('==================');

testStates.forEach(state => {
  const result = calculateSimpleTax(100, state);
  console.log(`${state}: ${result.percentage} | $100 → Tax: $${result.tax} → Total: $${result.total}`);
});

// 测试QR码中的NY餐厅
console.log('\n🏪 Testing Restaurant Scenario (NY):');
console.log('===================================');

const restaurant = {
  name: "Ken Canton CUISINE INC.",
  state: "NY",
  subtotal: 10.00
};

const nyResult = calculateSimpleTax(restaurant.subtotal, restaurant.state);
console.log(`Restaurant: ${restaurant.name}`);
console.log(`State: ${restaurant.state}`);
console.log(`Subtotal: $${restaurant.subtotal}`);
console.log(`Tax (${nyResult.percentage}): $${nyResult.tax}`);
console.log(`Total: $${nyResult.total}`);

// 验证与QR码数据
const expectedTax = 0.73; // 来自QR码
console.log(`\n✅ Tax Calculation Verification:`);
console.log(`Expected (from QR): $${expectedTax}`);
console.log(`Calculated: $${nyResult.tax}`);
console.log(`Match: ${Math.abs(nyResult.tax - expectedTax) < 0.01 ? '✅ YES' : '❌ NO'}`);

// 显示0%税率的州
console.log('\n🆓 No-Tax States:');
console.log('================');
const noTaxStates = Object.entries(PREPARED_FOOD_TAX_RATES)
  .filter(([state, rate]) => rate === 0)
  .map(([state, rate]) => state);

console.log(`States with 0% food tax: ${noTaxStates.join(', ')}`);

// 显示最高税率的州  
console.log('\n📈 Top 5 Highest Tax States:');
console.log('============================');
const sortedStates = Object.entries(PREPARED_FOOD_TAX_RATES)
  .sort(([,a], [,b]) => b - a)
  .slice(0, 5);

sortedStates.forEach(([state, rate]) => {
  console.log(`${state}: ${(rate * 100).toFixed(2)}%`);
});

console.log(`\n📝 Total States: ${Object.keys(PREPARED_FOOD_TAX_RATES).length}`);
console.log('✅ All 50 US States included!');
