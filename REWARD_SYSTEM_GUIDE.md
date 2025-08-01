# 🎉 FOODY 奖励系统测试指南

## 当前状态
✅ **奖励系统已完成并可以工作！**
- API 可以正常插入奖励记录到数据库
- 前端奖励弹窗显示"Claim New Member Reward 1000 FOODY"按钮
- 系统会检测用户是否已领取过奖励
- 支持真实和模拟代币发放

## 配置状态
- ✅ Supabase 数据库已配置
- ✅ RLS (行级安全) 策略已设置
- ✅ 服务角色密钥已配置
- ✅ 主钱包私钥已配置
- ✅ FOODY 代币合约地址已配置

## 测试步骤

### 1. 测试真实代币发放
```
访问：http://localhost:3000/test-real-token
1. 点击 "Check Main Wallet Balance" 检查主钱包余额
2. 点击 "Test Real Token Transfer" 测试发放100 FOODY代币
3. 查看是否有真实的交易哈希返回
```

### 2. 测试奖励弹窗
```
访问：http://localhost:3000/dashboard-diner
1. 连接钱包（地址：0x958a16ada1b69db030e905aaa3f637c7bd4344a7）
2. 点击 "My Rewards" 按钮
3. 应该看到 "Claim New Member Reward 1000 FOODY" 提示
4. 点击 "Claim Now" 按钮
5. 检查是否成功领取（查看交易哈希）
```

### 3. 清理测试数据（如需重新测试）
```
在 Supabase SQL Editor 中执行：CLEANUP_TEST_REWARDS.sql
这将删除测试用户的奖励记录，允许重新领取
```

## 技术细节

### 环境变量配置
```bash
# 主钱包配置（用于发放真实FOODY代币）
MAIN_WALLET_PRIVATE_KEY=0x3e626fbc978bf8bb1bc4bdbad905f9a9c09508527ecb95defc712530d31080cd
FOODY_TOKEN_ADDRESS=0x1022b1b028a2237c440dbac51dc6fc220d88c08f

# Supabase 服务角色（绕过RLS）
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### API 端点
- `GET /api/check-registration-reward?wallet={address}` - 检查奖励资格
- `POST /api/claim-registration-reward` - 领取新注册奖励
- `GET /api/diner-reward?wallet={address}` - 查看用户奖励记录
- `POST /api/test-real-token` - 测试真实代币发放

### 数据库表
- `diner_rewards` - 奖励记录表
- `diner_reward_statistics` - 统计视图
- `daily_diner_rewards` - 每日统计视图

## 从模拟到真实代币的切换

系统会自动检测环境变量：
- **有 MAIN_WALLET_PRIVATE_KEY**: 使用真实FOODY代币发放
- **无 MAIN_WALLET_PRIVATE_KEY**: 使用模拟代币发放

## 故障排除

### 如果代币发放失败
1. 检查主钱包是否有足够的ETH用于gas费
2. 检查主钱包是否有足够的FOODY代币
3. 检查网络连接（Base Mainnet）
4. 查看控制台日志获取详细错误信息

### 如果数据库插入失败
1. 检查 SUPABASE_SERVICE_ROLE_KEY 是否正确
2. 检查网络连接到 Supabase
3. 在 Supabase 中手动执行 RLS 修复脚本

## 成功指标
- ✅ 用户可以看到 "Claim New Member Reward" 提示
- ✅ 点击按钮后显示 "Claiming..." 状态
- ✅ 成功后奖励记录保存到数据库
- ✅ 返回真实的交易哈希（不是 mock_）
- ✅ 用户不能重复领取同一奖励

## 下一步
1. 在生产环境中配置真实的主钱包私钥
2. 监控主钱包余额，确保有足够的FOODY代币
3. 设置奖励发放的监控和告警
4. 考虑添加更多类型的奖励（比如推荐奖励）
