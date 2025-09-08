// app/api/diner-reward/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface DinerRewardRequest {
  walletAddress: string;
  email: string;
  role: string;
}

// FOODY 奖励配置
const DINER_REWARD_AMOUNT = 1000; // 1000 FOODY tokens
const REWARD_REASON = 'New Diner Registration Bonus';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, email, role, rewardType = 'registration', orderId, amount, txHash } = body;

    // 验证输入
    if (!walletAddress || !email || role !== 'diner') {
      return NextResponse.json(
        { error: 'Invalid request. Only diners are eligible for rewards.' },
        { status: 400 }
      );
    }

    // 验证钱包地址格式
    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return NextResponse.json(
        { error: 'Invalid wallet address format' },
        { status: 400 }
      );
    }

    // 注册奖励防重复发放
    if (rewardType === 'registration') {
      const { data: existingReward, error: checkError } = await supabase
        .from('diner_rewards')
        .select('*')
        .eq('wallet_address', walletAddress.toLowerCase())
        .eq('reward_reason', 'New Diner Registration Bonus')
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Database check error:', checkError);
        return NextResponse.json(
          { error: 'Database error while checking existing rewards' },
          { status: 500 }
        );
      }

      if (existingReward) {
        return NextResponse.json(
          { 
            error: 'Reward already claimed',
            message: 'This wallet has already received the registration reward',
            previousReward: {
              amount: existingReward.reward_amount,
              claimedAt: existingReward.created_at
            }
          },
          { status: 409 }
        );
      }
    }

    // 奖励类型和金额
    let rewardAmount = 1000;
    let rewardReason = 'New Diner Registration Bonus';
    if (rewardType === 'payment') {
      rewardAmount = amount || 10; // 默认支付奖励 10 FOODY，可根据实际业务调整
      rewardReason = orderId ? `Payment Reward for Order ${orderId}` : 'Payment Reward';
    }

    // 记录奖励发放
    const { data: rewardRecord, error: insertError } = await supabase
      .from('diner_rewards')
      .insert({
        wallet_address: walletAddress.toLowerCase(),
        email: email.toLowerCase(),
        reward_amount: rewardAmount,
        reward_reason: rewardReason,
        status: 'pending',
        created_at: new Date().toISOString(),
        order_id: orderId || null,
        tx_hash: txHash || null
      })
      .select()
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to record reward' },
        { status: 500 }
      );
    }

    // 模拟发放代币（在实际应用中，这里会调用智能合约或代币服务）
    // 更新状态为已完成
    const { error: updateError } = await supabase
      .from('diner_rewards')
      .update({ 
        status: 'completed',
        transaction_hash: txHash || `mock_tx_${Date.now()}`, // 在实际应用中使用真实的交易哈希
        completed_at: new Date().toISOString()
      })
      .eq('id', rewardRecord.id);

    if (updateError) {
      console.error('Database update error:', updateError);
      // 即使更新失败，奖励已记录，不返回错误
    }

    return NextResponse.json({
      success: true,
      message: `Congratulations! You've received ${rewardAmount} FOODY tokens for ${rewardType === 'registration' ? 'joining as a new diner' : 'your payment!'}`,
      reward: {
        amount: rewardAmount,
        reason: rewardReason,
        walletAddress: walletAddress,
        rewardId: rewardRecord.id,
        status: 'completed',
        orderId,
        txHash
      }
    });

  } catch (error) {
    console.error('Diner reward error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// 获取奖励统计
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let walletAddress = searchParams.get('wallet');
    if (walletAddress) walletAddress = walletAddress.toLowerCase();

    if (walletAddress) {
      // 查询特定钱包的奖励记录
      const { data: rewards, error } = await supabase
        .from('diner_rewards')
        .select('*')
        .eq('wallet_address', walletAddress);

      if (error) {
        return NextResponse.json({ error: 'Database query error' }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        wallet: walletAddress,
        rewards: rewards || [],
        totalRewarded: rewards?.reduce((sum, reward) => sum + reward.reward_amount, 0) || 0
      });
    }

    // 获取全局统计
    const { data: stats, error: statsError } = await supabase
      .from('diner_rewards')
      .select('reward_amount, status, created_at');

    if (statsError) {
      return NextResponse.json({ error: 'Database query error' }, { status: 500 });
    }

    const totalRewards = stats?.length || 0;
    const totalAmount = stats?.reduce((sum, reward) => sum + reward.reward_amount, 0) || 0;
    const completedRewards = stats?.filter(r => r.status === 'completed').length || 0;

    return NextResponse.json({
      success: true,
      statistics: {
        totalRewards,
        totalAmount,
        completedRewards,
        pendingRewards: totalRewards - completedRewards,
        averageReward: totalRewards > 0 ? totalAmount / totalRewards : 0
      }
    });

  } catch (error) {
    console.error('Stats query error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
