-- 清理测试用户的奖励记录，以便重新测试真实代币发放
-- 在 Supabase SQL Editor 中执行此脚本

-- 1. 删除 ken2 用户的测试奖励记录
DELETE FROM diner_rewards 
WHERE wallet_address = '0x958a16ada1b69db030e905aaa3f637c7bd4344a7'
AND reward_reason = 'New Diner Registration Bonus';

-- 2. 查看删除结果
SELECT 'Cleanup completed' as status, count(*) as remaining_records 
FROM diner_rewards 
WHERE wallet_address = '0x958a16ada1b69db030e905aaa3f637c7bd4344a7';

-- 3. 查看当前所有奖励记录
SELECT wallet_address, email, reward_amount, status, transaction_hash, created_at 
FROM diner_rewards 
ORDER BY created_at DESC;

-- 注意：删除记录后，该用户将再次有资格领取新注册奖励
