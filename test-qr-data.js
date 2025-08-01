// test-qr-data.js
// 测试QR码包含的数据格式

const sampleQRData = {
  restaurantId: "785e4179-5dc6-4d46-83d1-3c75c126fbf1",
  restaurantWalletAddress: "0x742d35Cc6634C0532925a3b8D0b4C3b0a7f", // 🆕 餐厅钱包地址
  restaurantInfo: {
    name: "Ken Canton CUISINE INC.",
    address: "150-30 71st Ave, Flushing, NY 11365",
    email: "foodyecoin01@gmail.com",
    phone: "1-718-888-8888",
    city: "Flushing",
    state: "NY"
  },
  orderId: "8888", // 更新: 使用真实订单ID而不是"general"
  amounts: {
    usdc: 21.78,    // 更新: 使用正确的NY州税率计算
    foody: 182963.366, // 对应更新FOODY数量
    subtotal: 20.00,
    tax: 1.78       // 更新: NY州实际税率 8.875%
  },
  tableNumber: "N/A",
  taxInfo: {
    rate: 0.08875,  // 更新: 使用准确的NY州食品税率
    zipCode: "11365",
    state: "NY"
  },
  timestamp: Date.now(),
  paymentCreatedAt: new Date().toISOString()
};

console.log('📱 Sample QR Code Data:');
console.log(JSON.stringify(sampleQRData, null, 2));

console.log('\n🔍 QR Data String Length:', JSON.stringify(sampleQRData).length);

// 模拟扫描处理
console.log('\n📱 Simulated Mobile Display:');
const scanTime = new Date().toLocaleString();
const paymentCreatedTime = new Date(sampleQRData.paymentCreatedAt).toLocaleString();

const displayInfo = `Scan successful!

🏪 Restaurant Info:
• Name: ${sampleQRData.restaurantInfo?.name || 'N/A'}
• Address: ${sampleQRData.restaurantInfo?.address || 'N/A'}
• Email: ${sampleQRData.restaurantInfo?.email || 'N/A'}
• Phone: ${sampleQRData.restaurantInfo?.phone || 'N/A'}

📋 Order Details:
• Restaurant ID: ${sampleQRData.restaurantId}
• Order ID: ${sampleQRData.orderId}
• Table: ${sampleQRData.tableNumber || 'N/A'}

💰 Payment Details:
• Subtotal: $${sampleQRData.amounts.subtotal.toFixed(2)} USDC
• Tax: $${sampleQRData.amounts.tax.toFixed(2)} USDC  
• Total: $${sampleQRData.amounts.usdc.toFixed(2)} USDC
• FOODY: ${sampleQRData.amounts.foody.toLocaleString()} FOODY

📊 Tax Info: ${sampleQRData.taxInfo ? `${(sampleQRData.taxInfo.rate * 100).toFixed(2)}% (${sampleQRData.taxInfo.state})` : 'N/A'}

⏰ Timestamps:
• Payment Created: ${paymentCreatedTime}
• Scanned At: ${scanTime}`;

console.log(displayInfo);
