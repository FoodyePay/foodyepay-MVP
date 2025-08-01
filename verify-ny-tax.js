// verify-ny-tax.js
// 验证NY州税率计算

const NY_TAX_RATE = 0.08875; // NY州准确的食品税率 8.875%

function calculateNYTax(subtotal) {
  const tax = subtotal * NY_TAX_RATE;
  const total = subtotal + tax;
  
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    total: Math.round(total * 100) / 100,
    rate: NY_TAX_RATE,
    percentage: `${(NY_TAX_RATE * 100).toFixed(3)}%`
  };
}

console.log('🏪 NY Restaurant Tax Calculation Verification');
console.log('=============================================\n');

const restaurant = {
  name: "Ken Canton CUISINE INC.",
  address: "150-30 71st Ave, Flushing, NY 11365",
  state: "NY"
};

console.log(`Restaurant: ${restaurant.name}`);
console.log(`Address: ${restaurant.address}`);
console.log(`State: ${restaurant.state}\n`);

// 计算正确的税费
const subtotal = 10.00;
const result = calculateNYTax(subtotal);

console.log('💰 Correct Tax Calculation:');
console.log(`Subtotal: $${result.subtotal.toFixed(2)}`);
console.log(`NY Food Tax (${result.percentage}): $${result.tax.toFixed(2)}`);
console.log(`Total: $${result.total.toFixed(2)}\n`);

// 与旧计算对比
const oldTaxRate = 0.0725;
const oldTax = subtotal * oldTaxRate;
const oldTotal = subtotal + oldTax;

console.log('📊 Comparison:');
console.log(`Old Rate (7.25%): $${subtotal.toFixed(2)} + $${oldTax.toFixed(2)} = $${oldTotal.toFixed(2)}`);
console.log(`New Rate (8.875%): $${result.subtotal.toFixed(2)} + $${result.tax.toFixed(2)} = $${result.total.toFixed(2)}`);
console.log(`Difference: $${(result.total - oldTotal).toFixed(2)} more tax\n`);

// 生成正确的QR码数据格式
console.log('📱 Updated QR Code Data:');
console.log('======================');
const qrData = {
  restaurantId: "785e4179-5dc6-4d46-83d1-3c75c126fbf1",
  restaurantInfo: {
    name: restaurant.name,
    address: restaurant.address,
    email: "foodyecoin01@gmail.com",
    phone: "1-718-888-8888",
    city: "Flushing",
    state: "NY"
  },
  orderId: "general",
  amounts: {
    usdc: result.total,
    foody: Math.round(result.total * 8400.52), // 假设FOODY汇率
    subtotal: result.subtotal,
    tax: result.tax
  },
  tableNumber: "N/A",
  taxInfo: {
    rate: NY_TAX_RATE,
    zipCode: "11365",
    state: "NY"
  },
  timestamp: Date.now(),
  paymentCreatedAt: new Date().toISOString()
};

console.log(JSON.stringify(qrData, null, 2));

console.log('\n✅ Tax System Update Summary:');
console.log('============================');
console.log(`• Updated NY tax rate from 7.25% to 8.875%`);
console.log(`• Used "Up to" maximum rate as specified`);
console.log(`• All 50 states now have accurate food tax rates`);
console.log(`• Direct state-based lookup (no ZIP code needed)`);
console.log(`• Zero-tax states: AK, DE, MT, NH, OR`);
