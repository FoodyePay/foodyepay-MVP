-- 快速创建 diner_rewards 表的简化脚本
-- 用于测试和调试

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

-- 插入测试数据（如果需要的话）
INSERT INTO diner_rewards (wallet_address, email, reward_amount, status, transaction_hash, completed_at) 
VALUES (
  '0x958a16ada1b69db030e905aaa3f637c7bd4344a7',
  'ken2@gmail.com',
  1000,
  'completed',
  'mock_test_tx_123456',
  NOW()
) ON CONFLICT (wallet_address) DO NOTHING;
