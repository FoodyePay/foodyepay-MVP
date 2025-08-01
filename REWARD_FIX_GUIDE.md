# 🎁 FoodyePay 奖励系统修复指南

## 🚨 当前问题
- ken2@gmail.com 和 foodyepay@gmail.com 没有收到注册奖励
- 原因：数据库表 `diner_rewards` 不存在

## ✅ 立即修复步骤

### 步骤 1: 在 Supabase 中设置数据库
1. 登录您的 Supabase 项目
2. 进入 **SQL Editor**
3. 复制并执行文件 `SETUP_SUPABASE_REWARDS.sql` 中的完整脚本
4. 点击 **Run** 执行

### 步骤 2: 验证设置
执行脚本后，您应该看到：
```
status: "Table created successfully"
reward_count: 2
```

### 步骤 3: 测试奖励系统
1. 访问: http://localhost:3000/test-reward-debug
2. 点击 "查询现有奖励" 按钮
3. 应该看到 ken2 和 foodyepay 的奖励记录

### 步骤 4: 刷新用户 Dashboard
1. 重新访问: http://localhost:3000/dashboard-diner
2. 奖励组件现在应该显示 "1000 FOODY Total Earned"

## 🔧 如果仍然有问题

### 检查 API 响应
访问: http://localhost:3000/api/diner-reward?wallet=0x958a16ada1b69db030e905aaa3f637c7bd4344a7

应该返回：
```json
{
  "success": true,
  "rewards": [
    {
      "id": 1,
      "walletAddress": "0x958a16ada1b69db030e905aaa3f637c7bd4344a7",
      "email": "ken2@gmail.com",
      "rewardAmount": 1000,
      "status": "completed"
    }
  ]
}
```

### 检查 foodyepay@gmail.com 的奖励
访问: http://localhost:3000/api/diner-reward?wallet=0xb4ffaac40f4ca6ecb006ae6d739262f1458b64a3

## 🚀 未来新用户奖励

数据库设置完成后，所有新注册的 Diner 用户将自动获得 1000 FOODY 奖励：

1. **注册时**: 自动调用 `/api/diner-reward` API
2. **奖励发放**: 
   - 有私钥：真实代币转账
   - 无私钥：模拟完成状态
3. **用户体验**: Dashboard 显示奖励历史

## 🔑 配置真实代币发放（可选）

在 `.env.local` 中添加：
```bash
MAIN_WALLET_PRIVATE_KEY=您的主钱包私钥
```

配置后，系统将从您的主钱包 `0xB4ffaAc40f4cA6ECb006AE6d739262f1458b64a3` 自动发放真实的 FOODY 代币。

---

## 📊 系统状态检查

- ✅ API 端点: `/api/diner-reward`
- ✅ 测试页面: `/test-reward-debug`
- ✅ 用户界面: Dashboard 奖励组件
- ⏳ 数据库表: 需要手动创建
- ⏳ 私钥配置: 可选

**执行 SQL 脚本后，奖励系统将完全正常工作！** 🎉
