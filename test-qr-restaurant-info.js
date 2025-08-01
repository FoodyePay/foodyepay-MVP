// test-qr-restaurant-info.js
// 测试QR码是否包含完整的餐厅信息

// 从截图1的QR码数据
const qrDataFromScreenshot = {
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

console.log('🧪 Testing QR Code Restaurant Info Display');
console.log('='.repeat(50));

function simulateDinerQRScan(paymentData) {
  console.log('\n📱 Simulating Mobile QR Scan...');
  
  // 格式化时间戳
  const scanTime = new Date().toLocaleString();
  const paymentCreatedTime = paymentData.paymentCreatedAt 
    ? new Date(paymentData.paymentCreatedAt).toLocaleString()
    : new Date(paymentData.timestamp).toLocaleString();
  
  // 格式化显示信息（包含完整餐厅信息和时间戳）
  const displayInfo = `Scan successful!

🏪 Restaurant Info:
• Name: ${paymentData.restaurantInfo?.name || 'N/A'}
• Address: ${paymentData.restaurantInfo?.address || 'N/A'}
• Email: ${paymentData.restaurantInfo?.email || 'N/A'}
• Phone: ${paymentData.restaurantInfo?.phone || 'N/A'}

📋 Order Details:
• Restaurant ID: ${paymentData.restaurantId}
• Order ID: ${paymentData.orderId}
• Table: ${paymentData.tableNumber || 'N/A'}

💰 Payment Details:
• Subtotal: $${paymentData.amounts.subtotal.toFixed(2)} USDC
• Tax: $${paymentData.amounts.tax.toFixed(2)} USDC  
• Total: $${paymentData.amounts.usdc.toFixed(2)} USDC
• FOODY: ${paymentData.amounts.foody.toLocaleString()} FOODY

📊 Tax Info: ${paymentData.taxInfo ? `${(paymentData.taxInfo.rate * 100).toFixed(3)}% (${paymentData.taxInfo.state})` : 'N/A'}

⏰ Timestamps:
• Payment Created: ${paymentCreatedTime}
• Scanned At: ${scanTime}`;

  console.log('Expected Mobile Display:');
  console.log(displayInfo);
  
  // 验证所有必需信息是否存在
  console.log('\n✅ Data Verification:');
  console.log(`Restaurant Name: ${paymentData.restaurantInfo?.name ? '✅' : '❌'}`);
  console.log(`Restaurant Address: ${paymentData.restaurantInfo?.address ? '✅' : '❌'}`);
  console.log(`Restaurant Email: ${paymentData.restaurantInfo?.email ? '✅' : '❌'}`);
  console.log(`Restaurant Phone: ${paymentData.restaurantInfo?.phone ? '✅' : '❌'}`);
  console.log(`Payment Amounts: ${paymentData.amounts ? '✅' : '❌'}`);
  console.log(`Tax Info: ${paymentData.taxInfo ? '✅' : '❌'}`);
  console.log(`Timestamp: ${paymentData.timestamp ? '✅' : '❌'}`);
  
  return displayInfo;
}

// 测试完整的QR码数据
console.log('🎯 Testing with Complete QR Data:');
const result = simulateDinerQRScan(qrDataFromScreenshot);

// 测试可能出现的问题场景
console.log('\n\n⚠️  Testing Potential Issues:');

// 1. 缺少餐厅信息的情况
const incompleteData = {
  ...qrDataFromScreenshot,
  restaurantInfo: null
};

console.log('\n1. Missing Restaurant Info:');
simulateDinerQRScan(incompleteData);

// 2. 部分餐厅信息缺失
const partialData = {
  ...qrDataFromScreenshot,
  restaurantInfo: {
    name: "Ken Canton CUISINE INC.",
    // 缺少其他信息
  }
};

console.log('\n2. Partial Restaurant Info:');
simulateDinerQRScan(partialData);
