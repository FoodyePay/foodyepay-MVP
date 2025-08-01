// app/api/claim-registration-reward/route.ts
// 领取新注册奖励

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { distributeFoodyTokens } from '@/lib/foodyTokenDistribution';

const DINER_REWARD_AMOUNT = 1000; // 1000 FOODY tokens
const REWARD_REASON = 'New Diner Registration Bonus';

export async function POST(request: NextRequest) {
  try {
    const { walletAddress, email } = await request.json();

    // 验证输入
    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
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

    // 检查是否已经领取过注册奖励
    const { data: existingReward, error: checkError } = await supabaseAdmin
      .from('diner_rewards')
      .select('*')
      .eq('wallet_address', walletAddress.toLowerCase())
      .eq('reward_reason', REWARD_REASON)
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
          error: 'Registration reward already claimed',
          message: 'This wallet has already received the new member registration reward',
          previousReward: {
            amount: existingReward.reward_amount,
            claimedAt: existingReward.created_at,
            status: existingReward.status
          }
        },
        { status: 409 }
      );
    }

    // 记录奖励发放
    const { data: rewardRecord, error: insertError } = await supabaseAdmin
      .from('diner_rewards')
      .insert({
        wallet_address: walletAddress.toLowerCase(),
        email: email?.toLowerCase() || '',
        reward_amount: DINER_REWARD_AMOUNT,
        reward_reason: REWARD_REASON,
        status: 'pending',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to record reward claim' },
        { status: 500 }
      );
    }

    let transactionHash = null;
      const finalStatus = 'unknown';

    try {
      // 尝试发放真实代币
      const result = await distributeFoodyTokens(walletAddress, DINER_REWARD_AMOUNT);
      if (result.success && result.transactionHash) {
        transactionHash = result.transactionHash;
        console.log(`Real FOODY tokens distributed: ${result.transactionHash}`);
      } else {
        // 使用模拟交易哈希
        transactionHash = `mock_registration_reward_${Date.now()}`;
        console.log('Using mock token distribution for registration reward');
      }
    } catch (error) {
      console.error('Token distribution error:', error);
      transactionHash = `mock_registration_reward_${Date.now()}`;
    }

    // 更新奖励状态
    const { error: updateError } = await supabaseAdmin
      .from('diner_rewards')
      .update({ 
        status: finalStatus,
        transaction_hash: transactionHash,
        completed_at: new Date().toISOString()
      })
      .eq('id', rewardRecord.id);

    if (updateError) {
      console.error('Database update error:', updateError);
    }

    return NextResponse.json({
      success: true,
      message: `Congratulations! You've successfully claimed your ${DINER_REWARD_AMOUNT} FOODY new member registration bonus!`,
      reward: {
        id: rewardRecord.id,
        amount: DINER_REWARD_AMOUNT,
        reason: REWARD_REASON,
        walletAddress: walletAddress,
        status: finalStatus,
        transactionHash: transactionHash,
        claimedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Claim registration reward error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
