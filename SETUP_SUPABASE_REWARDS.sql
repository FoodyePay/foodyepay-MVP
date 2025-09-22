-- FoodyePay 奖励系统数据库设置
-- 在 Supabase SQL Editor 中执行此脚本

-- 1. 创建 diner_rewards 表
CREATE TABLE IF NOT EXISTS diner_rewards (
  id SERIAL PRIMARY KEY,
  wallet_address VARCHAR(42) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL,
  reward_amount INTEGER NOT NULL DEFAULT 888,
  reward_reason VARCHAR(500) DEFAULT '平台奖励',
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  transaction_hash VARCHAR(66),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT unique_wallet_reward UNIQUE(wallet_address)
);

-- 2. 创建索引优化查询性能
CREATE INDEX IF NOT EXISTS idx_diner_rewards_wallet ON diner_rewards(wallet_address);
CREATE INDEX IF NOT EXISTS idx_diner_rewards_status ON diner_rewards(status);
CREATE INDEX IF NOT EXISTS idx_diner_rewards_created_at ON diner_rewards(created_at);

-- 3. 添加表注释
COMMENT ON TABLE diner_rewards IS 'Diner registration reward records table';
COMMENT ON COLUMN diner_rewards.wallet_address IS 'User wallet address (lowercase)';
COMMENT ON COLUMN diner_rewards.reward_amount IS 'FOODY token reward amount';
COMMENT ON COLUMN diner_rewards.status IS 'Reward status: pending(waiting), completed(done), failed(error)';
COMMENT ON COLUMN diner_rewards.transaction_hash IS 'Blockchain transaction hash (if applicable)';

-- 4. 创建统计视图
CREATE OR REPLACE VIEW diner_reward_statistics AS
SELECT
  COUNT(*) as total_rewards,
  SUM(reward_amount) as total_amount_distributed,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_rewards,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_rewards,
  COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_rewards,
  AVG(reward_amount) as average_reward_amount,
  DATE_TRUNC('day', MIN(created_at)) as first_reward_date,
  DATE_TRUNC('day', MAX(created_at)) as latest_reward_date
FROM diner_rewards;

-- 5. 创建每日统计视图
CREATE OR REPLACE VIEW daily_diner_rewards AS
SELECT
  DATE_TRUNC('day', created_at) as reward_date,
  COUNT(*) as daily_rewards,
  SUM(reward_amount) as daily_amount,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as daily_completed
FROM diner_rewards
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY reward_date DESC;

-- 6. 启用行级安全 (RLS)
ALTER TABLE diner_rewards ENABLE ROW LEVEL SECURITY;

-- 7. 创建安全策略：用户只能查看自己的奖励记录
CREATE POLICY "Users can view own rewards" ON diner_rewards
  FOR SELECT USING (wallet_address = lower(current_setting('app.current_wallet', true)));

-- 8. 创建安全策略：系统可以插入新的奖励记录
CREATE POLICY "System can insert rewards" ON diner_rewards
  FOR INSERT WITH CHECK (true);

-- 9. 创建安全策略：系统可以更新奖励状态
CREATE POLICY "System can update rewards" ON diner_rewards
  FOR UPDATE USING (true);

-- 10. 插入测试奖励数据（为现有用户）
INSERT INTO diner_rewards (wallet_address, email, reward_amount, status, transaction_hash, completed_at) 
VALUES 
  ('0x958a16ada1b69db030e905aaa3f637c7bd4344a7', 'ken2@gmail.com', 1000, 'completed', 'mock_reward_ken2_setup', NOW()),
  ('0xb4ffaac40f4ca6ecb006ae6d739262f1458b64a3', 'foodyepay@gmail.com', 1000, 'completed', 'mock_reward_foodyepay_setup', NOW())
ON CONFLICT (wallet_address) DO NOTHING;

-- 11. 验证设置
SELECT 'Table created successfully' as status, count(*) as reward_count FROM diner_rewards;
SELECT * FROM diner_reward_statistics;

-- 完成！现在您的奖励系统已经准备就绪 🎉
