// test-mobile-display.js
// 测试移动端友好的QR扫码显示格式

const qrData = {
  "restaurantId": "785e4179-5dc6-4d46-83d1-3c75c126fbf1",
  "restaurantInfo": {
    "name": "Ken Canton CUISINE INC.",
    "address": "158-30 71st Ave, Flushing, NY 11365",
    "email": "foodyecoind1@gmail.com", 
    "phone": "1-718-888-8888",
    "city": "Flushing",
    "state": "NY"
  },
  "orderId": "general",
  "amounts": {
    "usdc": 10.89,
    "foody": 91482,
    "subtotal": 10,
    "tax": 0.89
  },
  "tableNumber": "N/A",
  "taxInfo": {
    "rate": 0.08875,
    "zipCode": "11365",
    "state": "NY"
  },
  "timestamp": 1753993526858,
  "paymentCreatedAt": "2025-07-31T20:25:28.858Z"
};

console.log('📱 Testing Mobile-Friendly QR Scan Display');
console.log('='.repeat(50));

function simulateMobileScan(paymentData) {
  // 格式化时间戳
  const scanTime = new Date().toLocaleString();
  const paymentCreatedTime = paymentData.paymentCreatedAt 
    ? new Date(paymentData.paymentCreatedAt).toLocaleString()
    : new Date(paymentData.timestamp).toLocaleString();

  // 移动端优化版本 - 更紧凑的格式
  const restaurantInfo = `🏪 ${paymentData.restaurantInfo?.name || 'N/A'}
📍 ${paymentData.restaurantInfo?.address || 'N/A'}
📧 ${paymentData.restaurantInfo?.email || 'N/A'}
📞 ${paymentData.restaurantInfo?.phone || 'N/A'}`;

  const orderInfo = `📋 Order: ${paymentData.orderId}
🪑 Table: ${paymentData.tableNumber || 'N/A'}`;

  const paymentInfo = `💰 Payment Details:
• Subtotal: $${paymentData.amounts.subtotal.toFixed(2)} USDC
• Tax: $${paymentData.amounts.tax.toFixed(2)} USDC  
• Total: $${paymentData.amounts.usdc.toFixed(2)} USDC
• FOODY: ${paymentData.amounts.foody.toLocaleString()} FOODY`;

  const taxInfo = `📊 Tax: ${paymentData.taxInfo ? `${(paymentData.taxInfo.rate * 100).toFixed(3)}% (${paymentData.taxInfo.state})` : 'N/A'}`;

  const timeInfo = `⏰ Created: ${paymentCreatedTime}
🕐 Scanned: ${scanTime}`;

  // 分段显示，确保所有信息都能看到
  const fullDisplayInfo = `Scan successful!

${restaurantInfo}

${orderInfo}

${paymentInfo}

${taxInfo}

${timeInfo}`;

  return fullDisplayInfo;
}

const result = simulateMobileScan(qrData);
console.log('Mobile Display Output:');
console.log(result);

console.log('\n✅ Key Improvements:');
console.log('• Compact format for mobile screens');
console.log('• All restaurant info included');
console.log('• Clear section separation');
console.log('• Tax rate shows 3 decimal places (8.875%)');
console.log('• Timestamps for both creation and scan');

// 测试字符数限制
console.log(`\n📏 Character count: ${result.length} characters`);
if (result.length > 2000) {
  console.log('⚠️  Warning: Message might be too long for some mobile browsers');
} else {
  console.log('✅ Message length is mobile-friendly');
}
