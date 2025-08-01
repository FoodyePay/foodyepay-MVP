-- database/diner-rewards-schema.sql
-- Diner Registration Reward System Database Schema

-- Create diner_rewards table
CREATE TABLE IF NOT EXISTS diner_rewards (
  id SERIAL PRIMARY KEY,
  wallet_address VARCHAR(42) NOT NULL UNIQUE, -- Ethereum address
  email VARCHAR(255) NOT NULL,
  reward_amount INTEGER NOT NULL DEFAULT 1000, -- FOODY token amount
  reward_reason VARCHAR(500) DEFAULT 'New Diner Registration Bonus',
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  transaction_hash VARCHAR(66), -- Blockchain transaction hash
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT unique_wallet_reward UNIQUE(wallet_address)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_diner_rewards_wallet ON diner_rewards(wallet_address);
CREATE INDEX IF NOT EXISTS idx_diner_rewards_status ON diner_rewards(status);
CREATE INDEX IF NOT EXISTS idx_diner_rewards_created_at ON diner_rewards(created_at);

-- Add comments
COMMENT ON TABLE diner_rewards IS 'Diner registration reward records table';
COMMENT ON COLUMN diner_rewards.wallet_address IS 'User wallet address (lowercase)';
COMMENT ON COLUMN diner_rewards.reward_amount IS 'FOODY token reward amount';
COMMENT ON COLUMN diner_rewards.status IS 'Reward status: pending(waiting), completed(done), failed(error)';
COMMENT ON COLUMN diner_rewards.transaction_hash IS 'Blockchain transaction hash (if applicable)';

-- Create statistics view
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

-- Create daily statistics view
CREATE OR REPLACE VIEW daily_diner_rewards AS
SELECT
  DATE_TRUNC('day', created_at) as reward_date,
  COUNT(*) as daily_rewards,
  SUM(reward_amount) as daily_amount,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as daily_completed
FROM diner_rewards
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY reward_date DESC;

-- Row Level Security (RLS) policies
ALTER TABLE diner_rewards ENABLE ROW LEVEL SECURITY;

-- Create security policy: users can only view their own rewards
CREATE POLICY "Users can view own rewards" ON diner_rewards
  FOR SELECT USING (wallet_address = lower(current_setting('app.current_wallet', true)));

-- Create security policy: system can insert new reward records
CREATE POLICY "System can insert rewards" ON diner_rewards
  FOR INSERT WITH CHECK (true);

-- Create security policy: system can update reward status
CREATE POLICY "System can update rewards" ON diner_rewards
  FOR UPDATE USING (true);
