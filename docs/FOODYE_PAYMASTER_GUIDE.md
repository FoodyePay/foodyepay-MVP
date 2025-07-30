# Foodye Coin Paymaster 部署和使用指南

## 🎯 概述

Foodye Paymaster 允许用户使用 Foodye Coin 代替 ETH 支付 gas 费用，实现真正的 Web2 体验。

## 🚀 部署步骤

### 1. 环境准备

```bash
# 安装依赖
npm install ethers @openzeppelin/contracts

# 复制环境变量模板
cp .env.example .env.local
```

### 2. 配置环境变量

编辑 `.env.local` 文件：

```env
# Foodye Token 合约地址
NEXT_PUBLIC_FOODYE_TOKEN_ADDRESS=0x你的Foodye代币合约地址

# Paymaster 部署者私钥
PAYMASTER_PRIVATE_KEY=你的私钥

# Paymaster 拥有者地址（可选，默认为部署者）
PAYMASTER_OWNER_ADDRESS=0x拥有者地址

# Base 网络 RPC
NEXT_PUBLIC_RPC_URL=https://mainnet.base.org

# Bundler URL (Coinbase CDP)
NEXT_PUBLIC_BUNDLER_URL=https://api.developer.coinbase.com/rpc/v1/base/bundler

# 现有 USDC Paymaster（回退选项）
PAYMASTER_URL=https://api.developer.coinbase.com/rpc/v1/base/paymaster
```

### 3. 部署 Paymaster 合约

```bash
# 部署合约
node scripts/deployPaymaster.js
```

部署成功后，将返回的合约地址添加到环境变量：

```env
NEXT_PUBLIC_FOODYE_PAYMASTER_ADDRESS=0x部署后的合约地址
```

## 🛠️ 前端集成

### 使用 FoodyeGasPayment 组件

```tsx
import { FoodyeGasPayment } from '@/components/FoodyeGasPayment';

function MyComponent() {
  const [gasEstimate, setGasEstimate] = useState(0n);
  const [isPaymentReady, setIsPaymentReady] = useState(false);

  return (
    <div>
      <FoodyeGasPayment
        estimatedGasCost={gasEstimate}
        onPaymentReady={setIsPaymentReady}
        onApprovalComplete={(approved) => {
          console.log('Approval status:', approved);
        }}
      />
      
      <button 
        disabled={!isPaymentReady}
        onClick={handleTransaction}
      >
        发送交易（用 Foodye Coin 支付 gas）
      </button>
    </div>
  );
}
```

### 使用 useFoodyeWallet Hook

```tsx
import { useFoodyeWallet, FOODYE_WALLET_CONFIG } from '@/hooks/useFoodyeWallet';

function TransactionComponent() {
  const { 
    sendTransaction, 
    estimateGas, 
    canPayWithFoodye,
    isLoading 
  } = useFoodyeWallet(FOODYE_WALLET_CONFIG);

  const handlePayment = async () => {
    try {
      // 使用 Foodye Coin 支付 gas
      const hash = await sendTransaction({
        to: '0x目标地址',
        value: parseEther('0.01'),
        usefoodyeGas: true
      });
      
      console.log('交易成功:', hash);
    } catch (error) {
      console.error('交易失败:', error);
    }
  };

  return (
    <button onClick={handlePayment} disabled={isLoading}>
      {isLoading ? '处理中...' : '使用 Foodye Coin 支付'}
    </button>
  );
}
```

## 🔧 Paymaster 管理

### 检查余额和充值

```bash
# 检查 Paymaster 余额
curl -X GET http://localhost:3000/api/paymaster

# 或在合约中直接查看
# getDeposit() 返回 Paymaster 在 EntryPoint 中的余额
```

### 更新汇率

如果需要调整 Foodye Coin 和 ETH 的兑换比例：

```javascript
// 调用合约的 updateExchangeRate 方法
// 例如：1 ETH = 2,000,000 FOODYE
await paymasterContract.updateExchangeRate(2000000);
```

### 提取 Foodye Coin

当 Paymaster 收集了足够的 Foodye Coin 后：

```javascript
// 提取收集的 Foodye Coin
await paymasterContract.withdrawFoodye(
  '0x目标地址',
  提取数量
);
```

## 🎯 工作流程

1. **用户发起交易**
   - 前端估算 gas 费用
   - 计算需要的 Foodye Coin 数量

2. **检查和授权**
   - 检查用户 Foodye Coin 余额
   - 如果需要，请求授权 Paymaster

3. **构建 UserOperation**
   - 包含 `erc20: foodyeTokenAddress` 上下文
   - 发送到 Paymaster API

4. **Paymaster 验证**
   - 检查余额和授权
   - 返回签名的 paymasterAndData

5. **交易执行**
   - EntryPoint 执行交易
   - Paymaster 用 ETH 支付 gas
   - 从用户扣除相应的 Foodye Coin

## 📊 监控和维护

### 关键指标

- Paymaster ETH 余额
- 收集的 Foodye Coin 数量
- 交易成功率
- Gas 消耗统计

### 建议设置

- 设置余额监控警报（当 ETH < 0.05 时）
- 定期提取和变现 Foodye Coin
- 根据市场情况调整汇率
- 监控异常交易和潜在攻击

## 🔒 安全考虑

1. **私钥安全**
   - 使用硬件钱包或 KMS 管理 Paymaster 私钥
   - 定期轮换私钥

2. **汇率控制**
   - 设置合理的汇率上下限
   - 实现紧急暂停功能

3. **余额管理**
   - 设置最大单笔交易限制
   - 实现余额不足时的回退机制

4. **监控和审计**
   - 记录所有交易日志
   - 定期审计合约状态
   - 监控异常活动

## 🚨 故障排除

### 常见问题

1. **交易失败: 余额不足**
   - 检查 Paymaster ETH 余额
   - 充值到 EntryPoint

2. **授权失败**
   - 检查 Foodye Token 合约地址
   - 验证用户余额

3. **Gas 估算错误**
   - 更新 gas 价格参数
   - 检查网络拥堵情况

### 调试工具

```bash
# 检查 Paymaster 状态
curl http://localhost:3000/api/paymaster

# 查看交易日志
# 检查浏览器开发者工具的网络标签
```

## 🎉 成功标志

当以下情况全部满足时，说明部署成功：

✅ Paymaster 合约成功部署
✅ API 端点正常响应
✅ 前端组件正确显示授权状态
✅ 用户可以成功用 Foodye Coin 支付 gas
✅ 交易在区块链上确认

恭喜！你现在拥有了一个完全支持 Foodye Coin 支付 gas 的系统！🚀
