# 🚨 奖励系统快速修复指南

## 问题诊断
用户 ken2 注册成功但没有收到奖励，可能的原因：

1. **数据库表未创建** ❌
2. **环境变量未配置** ⚠️ 
3. **API 调用失败** ❓

## 🔧 立即修复步骤

### 步骤 1: 创建数据库表
在您的 Supabase 项目中执行以下 SQL：

```sql
-- 创建 diner_rewards 表
CREATE TABLE IF NOT EXISTS diner_rewards (
  id SERIAL PRIMARY KEY,
  wallet_address VARCHAR(42) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL,
  reward_amount INTEGER NOT NULL DEFAULT 1000,
  reward_reason VARCHAR(500) DEFAULT 'New Diner Registration Bonus',
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  transaction_hash VARCHAR(66),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT unique_wallet_reward UNIQUE(wallet_address)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_diner_rewards_wallet ON diner_rewards(wallet_address);
CREATE INDEX IF NOT EXISTS idx_diner_rewards_status ON diner_rewards(status);
```

### 步骤 2: 手动为 ken2 创建奖励记录
```sql
-- 为 ken2 创建奖励记录
INSERT INTO diner_rewards (wallet_address, email, reward_amount, status, transaction_hash, completed_at) 
VALUES (
  '0x958a16ada1b69db030e905aaa3f637c7bd4344a7',
  'ken2@gmail.com',
  1000,
  'completed',
  'mock_manual_reward_ken2',
  NOW()
) ON CONFLICT (wallet_address) DO NOTHING;
```

### 步骤 3: 测试系统
访问: http://localhost:3000/test-reward-debug

点击 "查询现有奖励" 按钮，应该能看到 ken2 的奖励记录。

### 步骤 4: 配置真实代币发放（可选）
在 `.env.local` 中添加：
```bash
MAIN_WALLET_PRIVATE_KEY=你的主钱包私钥
```

## 🧪 立即测试

1. **检查数据库表**: 执行上面的 SQL
2. **刷新 Dashboard**: 重新打开 http://localhost:3000/dashboard-diner
3. **查看奖励**: 应该显示 1000 FOODY 奖励

## 📞 如果还是不工作

1. **检查浏览器控制台**: F12 查看错误信息
2. **检查服务器日志**: 查看 npm run dev 的终端输出
3. **测试 API**: 访问 http://localhost:3000/test-reward-debug

---

**目前状态**: 系统已配置为在没有私钥时使用模拟奖励，确保用户体验不受影响。
