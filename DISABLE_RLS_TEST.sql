-- 临时禁用 RLS 进行测试
-- 在 Supabase SQL Editor 中执行此脚本

-- 1. 临时禁用行级安全
ALTER TABLE diner_rewards DISABLE ROW LEVEL SECURITY;

-- 2. 验证禁用状态
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'diner_rewards';

-- 3. 测试插入
INSERT INTO diner_rewards (wallet_address, email, reward_amount, status) 
VALUES ('test_' || extract(epoch from now()), 'test@example.com', 1000, 'pending')
ON CONFLICT (wallet_address) DO NOTHING;

-- 4. 清理测试数据
DELETE FROM diner_rewards WHERE wallet_address LIKE 'test_%';

-- 注意：这会临时禁用安全策略！
-- 测试完成后请重新启用 RLS
-- 命令：ALTER TABLE diner_rewards ENABLE ROW LEVEL SECURITY;
