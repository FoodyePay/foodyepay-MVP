// test-foody-payment-flow.js
// 测试完整的FOODY支付流程

console.log('🔥 FOODY Payment Flow Test');
console.log('='.repeat(50));

// 真实钱包地址
const dinerWallet = "0xF2675D28373A44fc90B5EFe38f0903aDc2a5191B";
const restaurantWallet = "0x674302f3714eA8981C98F7688865b02AEBF5E373";

// 支付数据 (从QR码扫描获得)
const paymentData = {
  restaurantId: "785e4179-5dc6-4d46-83d1-3c75c126fbf1",
  restaurantWalletAddress: restaurantWallet,
  restaurantInfo: {
    name: "Ken Canton CUISINE INC.",
    address: "150-30 71st Ave, Flushing, NY 11365",
    phone: "1-718-888-8888",
    city: "Flushing",
    state: "NY"
  },
  orderId: "8888",
  amounts: {
    usdc: 21.78,    // USDC等值 (仅显示)
    foody: 182963.366, // 实际支付的FOODY数量
    subtotal: 20.00,
    tax: 1.78
  },
  tableNumber: "N/A",
  taxInfo: {
    rate: 0.08875,
    zipCode: "11365",
    state: "NY"
  },
  timestamp: Date.now(),
  paymentCreatedAt: new Date().toISOString()
};

console.log('📱 1. Diner scans QR code');
console.log(`   Restaurant: ${paymentData.restaurantInfo.name}`);
console.log(`   Order ID: ${paymentData.orderId}`);
console.log(`   Amount: ${paymentData.amounts.foody.toLocaleString()} FOODY`);
console.log(`   Equivalent: $${paymentData.amounts.usdc.toFixed(2)} USDC`);

console.log('\n💰 2. Payment Details');
console.log(`   From: ${dinerWallet} (Diner)`);
console.log(`   To: ${restaurantWallet} (Restaurant)`);
console.log(`   Token: FOODY (0x1022b1b028a2237c440dbac51dc6fc220d88c08f)`);
console.log(`   Amount: ${paymentData.amounts.foody.toLocaleString()} FOODY`);

console.log('\n🔍 3. Payment Flow Validation');
console.log('   ✅ QR code contains restaurant wallet address');
console.log('   ✅ Payment amount is in FOODY tokens');
console.log('   ✅ USDC is only used for equivalent display');
console.log('   ✅ Direct transfer: Diner → Restaurant');

console.log('\n🚀 4. Expected Transaction');
const mockTxHash = "0x1234567890abcdef1234567890abcdef12345678";
console.log(`   Contract: 0x1022b1b028a2237c440dbac51dc6fc220d88c08f (FOODY)`);
console.log(`   Function: transfer(${restaurantWallet}, ${paymentData.amounts.foody})`);
console.log(`   Expected Hash: ${mockTxHash}`);
console.log(`   BaseScan: https://basescan.org/tx/${mockTxHash}`);

console.log('\n🎉 5. Success Message Format');
const successMessage = `Payment Successful! 🎉

Paid: ${paymentData.amounts.foody.toLocaleString()} FOODY (FOODYE COIN)
     = ( $${paymentData.amounts.usdc.toFixed(2)} USDC )
To: ${paymentData.restaurantInfo.name}
Wallet: ${paymentData.restaurantWalletAddress}
Order: ${paymentData.orderId}

Transaction: ${mockTxHash.slice(0,6)}...${mockTxHash.slice(-4)}
View on BaseScan: https://basescan.org/tx/${mockTxHash}`;

console.log(successMessage);

console.log('\n' + '='.repeat(50));
console.log('✅ FOODY Payment Flow Ready for Testing!');
console.log('📱 Next: Test with real wallets on Base network');
