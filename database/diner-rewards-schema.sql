-- database/diner-rewards-schema.sql
-- Diner 注册奖励系统数据库架构

-- 创建 diner_rewards 表
CREATE TABLE IF NOT EXISTS diner_rewards (
  id SERIAL PRIMARY KEY,
  wallet_address VARCHAR(42) NOT NULL UNIQUE, -- 以太坊地址
  email VARCHAR(255) NOT NULL,
  reward_amount INTEGER NOT NULL DEFAULT 1000, -- FOODY 代币数量
  reward_reason VARCHAR(500) DEFAULT 'New Diner Registration Bonus',
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  transaction_hash VARCHAR(66), -- 区块链交易哈希
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT unique_wallet_reward UNIQUE(wallet_address)
);

-- 创建索引提高查询性能
CREATE INDEX IF NOT EXISTS idx_diner_rewards_wallet ON diner_rewards(wallet_address);
CREATE INDEX IF NOT EXISTS idx_diner_rewards_status ON diner_rewards(status);
CREATE INDEX IF NOT EXISTS idx_diner_rewards_created_at ON diner_rewards(created_at);

-- 添加注释
COMMENT ON TABLE diner_rewards IS 'Diner 注册奖励记录表';
COMMENT ON COLUMN diner_rewards.wallet_address IS '用户钱包地址（小写）';
COMMENT ON COLUMN diner_rewards.reward_amount IS 'FOODY 代币奖励数量';
COMMENT ON COLUMN diner_rewards.status IS '奖励状态：pending(待发放), completed(已完成), failed(失败)';
COMMENT ON COLUMN diner_rewards.transaction_hash IS '区块链交易哈希（如果适用）';

-- 创建统计视图
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

-- 创建每日统计视图
CREATE OR REPLACE VIEW daily_diner_rewards AS
SELECT 
  DATE_TRUNC('day', created_at) as reward_date,
  COUNT(*) as daily_rewards,
  SUM(reward_amount) as daily_amount,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as daily_completed
FROM diner_rewards
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY reward_date DESC;

-- Row Level Security (RLS) 安全策略
ALTER TABLE diner_rewards ENABLE ROW LEVEL SECURITY;

-- 创建安全策略：用户只能查看自己的奖励记录
CREATE POLICY "Users can view own rewards" ON diner_rewards
  FOR SELECT USING (wallet_address = lower(current_setting('app.current_wallet', true)));

-- 创建安全策略：系统可以插入新的奖励记录
CREATE POLICY "System can insert rewards" ON diner_rewards
  FOR INSERT WITH CHECK (true);

-- 创建安全策略：系统可以更新奖励状态
CREATE POLICY "System can update rewards" ON diner_rewards
  FOR UPDATE USING (true);
