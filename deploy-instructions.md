# 🚀 Foodye Paymaster 部署指南

## 📋 部署前检查清单

### 1. 环境变量配置
在你的 `.env.local` 文件中添加以下变量：

```bash
# Foodye Token 合约地址（你需要先部署 Foodye Token）
NEXT_PUBLIC_FOODYE_TOKEN_ADDRESS=0x你的FoodyeToken地址

# Paymaster 部署者私钥
PAYMASTER_PRIVATE_KEY=你的私钥

# Paymaster 所有者地址（可选，默认使用部署者地址）
PAYMASTER_OWNER_ADDRESS=你的所有者地址

# Base 网络 RPC URL
NEXT_PUBLIC_RPC_URL=https://mainnet.base.org

# Bundler URL（Coinbase CDP）
NEXT_PUBLIC_BUNDLER_URL=https://api.developer.coinbase.com/rpc/v1/base/bundler
```

### 2. 钱包准备
- 确保部署钱包至少有 0.05 ETH（用于部署 + 初始存款）
- 记录钱包地址作为 Paymaster 所有者

### 3. Foodye Token 准备
- 确保 Foodye Token 合约已部署
- 记录 Foodye Token 合约地址

## 🔧 部署步骤

### 步骤 1：安装部署依赖
```bash
npm install
```

### 步骤 2：编译合约
```bash
npx hardhat compile
```

### 步骤 3：部署 Paymaster
```bash
node scripts/deployPaymaster.js
```

### 步骤 4：验证部署
部署成功后，你会看到：
- ✅ Paymaster 合约地址
- ✅ 初始 ETH 存款确认
- ✅ 环境变量提示

### 步骤 5：更新环境变量
将部署脚本输出的 `NEXT_PUBLIC_FOODYE_PAYMASTER_ADDRESS` 添加到 `.env.local`

## 🧪 测试部署

### 测试 1：检查 Paymaster 余额
```javascript
const paymaster = new ethers.Contract(paymasterAddress, abi, provider);
const deposit = await paymaster.getDeposit();
console.log(`Paymaster deposit: ${ethers.formatEther(deposit)} ETH`);
```

### 测试 2：计算 Foodye 代币需求
```javascript
const gasCost = ethers.parseEther('0.001'); // 1 milli ETH
const foodyeNeeded = await paymaster.getRequiredFoodyeAmount(gasCost);
console.log(`Foodye tokens needed: ${foodyeNeeded}`);
```

## 🎯 部署后配置

### 1. 设置汇率（如果需要）
默认汇率：1 ETH = 1,000,000 FOODYE
```javascript
await paymaster.updateExchangeRate(1000000); // 根据需要调整
```

### 2. 追加 ETH 存款（如果需要）
```javascript
await paymaster.deposit({ value: ethers.parseEther('0.1') });
```

### 3. 前端集成
更新你的前端代码使用新的 Paymaster 地址

## ⚠️ 重要提醒

1. **安全性**：妥善保管 PAYMASTER_PRIVATE_KEY
2. **汇率管理**：定期监控和调整 Foodye/ETH 汇率
3. **余额监控**：定期检查 Paymaster ETH 余额，及时充值
4. **测试先行**：在主网部署前，先在测试网充分测试

## 🔍 故障排除

### 常见问题：

**Q: 部署失败，提示 "Insufficient ETH balance"**
A: 确保部署钱包有足够 ETH（至少 0.05 ETH）

**Q: 合约验证失败**
A: 检查 Foodye Token 地址是否正确

**Q: 用户交易失败**
A: 检查用户是否有足够 Foodye Token 余额和授权

### 调试命令：
```bash
# 检查网络连接
curl -X POST https://mainnet.base.org -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'

# 检查钱包余额
# 在 Node.js 中运行
const balance = await provider.getBalance('你的钱包地址');
console.log(ethers.formatEther(balance));
```
