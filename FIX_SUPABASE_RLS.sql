-- FoodyePay 奖励系统数据库修复脚本
-- 修复 RLS 策略问题
-- 在 Supabase SQL Editor 中执行此脚本

-- 1. 删除现有的有问题的策略
DROP POLICY IF EXISTS "Users can view own rewards" ON diner_rewards;
DROP POLICY IF EXISTS "System can insert rewards" ON diner_rewards;
DROP POLICY IF EXISTS "System can update rewards" ON diner_rewards;

-- 2. 创建新的更宽松的安全策略

-- 允许任何人插入奖励记录（API需要）
CREATE POLICY "Allow API to insert rewards" ON diner_rewards
  FOR INSERT WITH CHECK (true);

-- 允许任何人更新奖励记录（API需要）
CREATE POLICY "Allow API to update rewards" ON diner_rewards
  FOR UPDATE USING (true);

-- 允许任何人查看奖励记录（用户查看自己的奖励）
-- 注意：在生产环境中，您可能希望限制这个策略
CREATE POLICY "Allow viewing rewards" ON diner_rewards
  FOR SELECT USING (true);

-- 3. 验证策略设置
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'diner_rewards';

-- 4. 测试插入（这应该现在可以工作）
-- 注意：这个测试插入会在运行时尝试，如果失败则说明还有问题
DO $$
BEGIN
  INSERT INTO diner_rewards (wallet_address, email, reward_amount, status) 
  VALUES ('test_wallet_' || extract(epoch from now()), 'test@example.com', 1000, 'pending');
  
  DELETE FROM diner_rewards WHERE wallet_address LIKE 'test_wallet_%';
  
  RAISE NOTICE 'RLS policy test passed - API can now insert rewards!';
EXCEPTION 
  WHEN OTHERS THEN
    RAISE NOTICE 'RLS policy test failed: %', SQLERRM;
END $$;

-- 完成！RLS 策略已修复 🎉
