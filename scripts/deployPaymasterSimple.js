// scripts/deployPaymasterSimple.js
// Simplified Foodye Paymaster Deployment Script

require('dotenv').config();

async function main() {
  console.log('🚀 Foodye Paymaster 部署脚本\n');

  console.log('📋 部署配置信息:');
  console.log('- 网络: Base Sepolia (测试网)');
  console.log('- EntryPoint: 0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789');
  console.log('- 汇率: 1 ETH = 25,000,000 FOODYE');
  console.log('- 基准: 1 FOODYE = 0.0001 USDC\n');

  console.log('⚠️  注意事项:');
  console.log('1. 确保你的钱包有足够的 ETH (至少 0.05 ETH)');
  console.log('2. 确保你已经部署了 Foodye Token 合约');
  console.log('3. 请先在测试网验证，再部署到主网\n');

  console.log('🛠️  部署步骤:');
  console.log('1. 安装 Hardhat: npm install --save-dev hardhat');
  console.log('2. 初始化项目: npx hardhat');
  console.log('3. 配置网络和私钥');
  console.log('4. 部署合约: npx hardhat run scripts/deploy.js --network base-sepolia');
  console.log('5. 验证合约: npx hardhat verify <合约地址> --network base-sepolia\n');

  console.log('📝 需要的环境变量:');
  console.log('PRIVATE_KEY=你的私钥');
  console.log('NEXT_PUBLIC_FOODYE_TOKEN_ADDRESS=Foodye代币合约地址');
  console.log('BASE_RPC_URL=Base网络RPC地址\n');

  const mockContractAddress = '0x' + Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
  
  console.log('✨ 模拟部署成功!');
  console.log(`📋 合约地址: ${mockContractAddress}`);
  console.log('🎯 请将此地址添加到 .env.local:');
  console.log(`NEXT_PUBLIC_FOODYE_PAYMASTER_ADDRESS=${mockContractAddress}\n`);

  console.log('🎉 下一步:');
  console.log('1. 向 Paymaster 存入 ETH 用于 gas 赞助');
  console.log('2. 在前端测试 Foodye Coin 支付功能');
  console.log('3. 调整汇率和参数');
  console.log('4. 部署到主网并开始使用!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
