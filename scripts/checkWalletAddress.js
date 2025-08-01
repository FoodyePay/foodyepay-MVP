// scripts/checkWalletAddress.js
// 检查私钥对应的钱包地址

const { privateKeyToAccount } = require('viem/accounts');

const privateKey = process.env.MAIN_WALLET_PRIVATE_KEY || '0x3e626fbc978bf8bb1bc4bdbad905f9a9c09508527ecb95defc712530d31080cd';
const expectedAddress = '0xB4ffaAc40f4cA6ECb006AE6d739262f1458b64a3';

console.log('🔍 Checking wallet address...');
console.log('Private Key:', privateKey.slice(0, 10) + '...');

try {
  const account = privateKeyToAccount(privateKey);
  console.log('Derived Address:', account.address);
  console.log('Expected Address:', expectedAddress);
  console.log('Match:', account.address.toLowerCase() === expectedAddress.toLowerCase() ? '✅ YES' : '❌ NO');
  
  if (account.address.toLowerCase() !== expectedAddress.toLowerCase()) {
    console.log('\n⚠️  Private key does not match the expected main wallet address!');
    console.log('Please provide the correct private key for address:', expectedAddress);
  } else {
    console.log('\n✅ Private key matches the main wallet address!');
  }
} catch (error) {
  console.error('❌ Error:', error.message);
}
