# 🎉 FoodyePay Diner 奖励系统 - 主钱包发放方案

## 💰 系统概述

新注册的 Diner 用户将自动获得 **1000 FOODY 代币**奖励，代币直接从您的主钱包发放：
- **主钱包地址**: `0xB4ffaAc40f4cA6ECb006AE6d739262f1458b64a3`
- **当前余额**: 238,988,999,877.00476 FOODY
- **发放方式**: 智能合约自动转账
- **链**: Base Mainnet (Chain ID: 8453)

## 🔧 部署步骤

### 1. 配置环境变量

在您的 `.env.local` 文件中添加：

```bash
# 主钱包私钥（必需）
MAIN_WALLET_PRIVATE_KEY=your_private_key_here

# Base RPC URL（可选，使用默认或自定义）
NEXT_PUBLIC_RPC_URL=https://mainnet.base.org

# 管理员 API 密钥（可选，用于查看统计）
ADMIN_API_KEY=your_secure_admin_key
```

⚠️ **安全提醒**: 私钥是敏感信息，请确保：
- 不要提交到版本控制
- 使用安全的环境变量管理
- 考虑使用硬件钱包或多签钱包

### 2. 执行数据库脚本

在您的 Supabase 项目中执行：

```sql
-- 执行文件: database/diner-rewards-schema-clean.sql
-- 这将创建奖励表、索引、视图和安全策略
```

### 3. 测试奖励系统

#### 测试新用户注册：
1. 用新钱包地址注册 Diner 账户
2. 检查是否收到 1000 FOODY 代币
3. 在 Dashboard 查看奖励记录

#### 查看管理员统计：
```bash
curl -H "Authorization: Bearer your_admin_key" \
     https://your-domain.com/api/admin/reward-stats
```

## 📊 API 端点

### `/api/diner-reward`
- **POST**: 发放奖励（自动在注册时调用）
- **GET**: 查询用户奖励记录

### `/api/admin/reward-stats`
- **GET**: 管理员统计（需要认证）
- 返回：总发放量、主钱包余额、完成率等

## 🔍 监控和管理

### 查看主钱包状态
```javascript
// 获取余额和发放能力
const info = await getTokenDistributionInfo();
console.log(`余额: ${info.balance.formatted} FOODY`);
console.log(`最大奖励数: ${info.balance.maxRewards}`);
```

### 交易记录
所有奖励发放都会：
- 记录在 Supabase 数据库
- 生成真实的链上交易
- 提供 BaseScan 交易哈希

## 🛡️ 安全措施

1. **防重复发放**: 每个钱包地址只能领取一次
2. **余额检查**: 发放前验证主钱包余额
3. **交易确认**: 等待链上交易确认
4. **错误处理**: 失败时不影响注册流程
5. **日志记录**: 完整的操作日志

## 📈 预期成本

根据您的余额，可以发放：
- **最大奖励数量**: 238,988,999 次（按 1000 FOODY/次计算）
- **Gas 费用**: 每次约 $0.01-0.05（Base 链低 gas）
- **持续时间**: 足够数年的新用户增长

## 🚀 上线后优化

1. **批量发放**: 如果用户量大，可启用批量发放减少 gas 费
2. **奖励池合约**: 可升级到专门的奖励池智能合约
3. **动态奖励**: 根据市场情况调整奖励金额
4. **多种奖励**: 扩展到其他场景的奖励

## 🔄 工作流程

```
用户注册 Diner → 验证邮箱 → 
自动调用奖励 API → 检查资格 → 
从主钱包转账 FOODY → 更新数据库 → 
显示奖励成功
```

## 📞 故障排除

### 常见问题：
1. **私钥配置错误**: 检查 `.env.local` 格式
2. **余额不足**: 监控主钱包 FOODY 余额
3. **网络问题**: 确认 RPC 连接正常
4. **权限问题**: 验证钱包权限和私钥

### 日志查看：
- API 日志: `/api/diner-reward`
- 数据库日志: Supabase Dashboard
- 交易日志: BaseScan.org

---

## ✅ 检查清单

- [ ] 配置 `MAIN_WALLET_PRIVATE_KEY` 环境变量
- [ ] 执行数据库脚本
- [ ] 测试新用户注册奖励
- [ ] 验证交易在 BaseScan 上可见
- [ ] 设置管理员监控
- [ ] 备份私钥到安全位置

🎉 **系统就绪！您的 FoodyePay 现在可以自动奖励新 Diner 用户了！**
