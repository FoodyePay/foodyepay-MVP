// test-payment-success-format.js
// 测试支付成功消息的显示格式

const mockPaymentData = {
  restaurantId: "785e4179-5dc6-4d46-83d1-3c75c126fbf1",
  restaurantWalletAddress: "0x674302f3714eA8981C98F768865b02AEBF5E373",
  restaurantInfo: {
    name: "Ken Canton CUISINE INC.",
    address: "150-30 71st Ave, Flushing, NY 11365",
    email: "foodyecoin01@gmail.com",
    phone: "1-718-888-8888"
  },
  orderId: "8000",
  amounts: {
    usdc: 2.18,
    foody: 18313.138,
    subtotal: 2.00,
    tax: 0.18
  }
};

console.log('🎉 Payment Success Message Format Test\n');

// 旧格式（截图2）
const oldFormat = `Payment Successful! 🎉

Paid: $${mockPaymentData.amounts.usdc.toFixed(2)} USDC
To: ${mockPaymentData.restaurantInfo.name}
Wallet: ${mockPaymentData.restaurantWalletAddress}
Order: ${mockPaymentData.orderId}`;

console.log('❌ Old Format (Screenshot 2):');
console.log('─'.repeat(50));
console.log(oldFormat);

console.log('\n' + '='.repeat(60) + '\n');

// 新格式（截图1）
const newFormat = `Payment Successful! 🎉

Paid: ${mockPaymentData.amounts.foody.toLocaleString()} FOODY (FOODYE COIN)
     = ( $${mockPaymentData.amounts.usdc.toFixed(2)} USDC )
To: ${mockPaymentData.restaurantInfo.name}
Wallet: ${mockPaymentData.restaurantWalletAddress}
Order: ${mockPaymentData.orderId}`;

console.log('✅ New Format (Screenshot 1):');
console.log('─'.repeat(50));
console.log(newFormat);

console.log('\n🎯 Key Changes:');
console.log('• Priority: FOODY amount first, USDC as equivalent value');
console.log('• Format: "18,313.138 FOODY (FOODYE COIN)"');
console.log('• Secondary: "= ( $2.18 USDC )" with parentheses');
console.log('• Maintains: Restaurant name, wallet address, order ID');

console.log('\n📱 This matches the mobile notification style from Screenshot 1!');
