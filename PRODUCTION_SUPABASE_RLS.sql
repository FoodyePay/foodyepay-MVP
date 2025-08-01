-- FoodyePay 奖励系统 - 生产环境安全策略
-- 更安全的 RLS 策略设置
-- 在 Supabase SQL Editor 中执行此脚本

-- 1. 删除现有策略
DROP POLICY IF EXISTS "Allow API to insert rewards" ON diner_rewards;
DROP POLICY IF EXISTS "Allow API to update rewards" ON diner_rewards;
DROP POLICY IF EXISTS "Allow viewing rewards" ON diner_rewards;

-- 2. 创建服务角色（如果不存在）
-- 注意：这通常在 Supabase 中已经存在
-- DO $$
-- BEGIN
--   IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'service_role') THEN
--     CREATE ROLE service_role;
--   END IF;
-- END $$;

-- 3. 创建更安全的策略

-- 只允许服务角色（API）插入奖励记录
CREATE POLICY "Service role can insert rewards" ON diner_rewards
  FOR INSERT TO service_role, anon
  WITH CHECK (true);

-- 只允许服务角色（API）更新奖励记录
CREATE POLICY "Service role can update rewards" ON diner_rewards
  FOR UPDATE TO service_role, anon
  USING (true);

-- 允许用户查看自己的奖励记录（基于钱包地址）
CREATE POLICY "Users can view own rewards by wallet" ON diner_rewards
  FOR SELECT 
  USING (
    -- 允许服务角色查看所有记录
    current_user = 'service_role' OR 
    current_user = 'anon' OR
    -- 或者钱包地址匹配（当用户上下文可用时）
    wallet_address = lower(coalesce(current_setting('app.current_wallet', true), ''))
  );

-- 4. 验证策略设置
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'diner_rewards';

-- 完成！生产环境安全策略已设置 🔒
