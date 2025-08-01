// app/api/test-reward/route.ts
// 测试奖励 API - 用于调试

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { walletAddress, email } = await request.json();
    
    console.log('🧪 Test reward API called with:', { walletAddress, email });
    
    // 验证输入
    if (!walletAddress || !email) {
      return NextResponse.json(
        { error: 'Wallet address and email are required' },
        { status: 400 }
      );
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return NextResponse.json(
        { error: 'Invalid wallet address format' },
        { status: 400 }
      );
    }

    // 检查数据库表是否存在
    console.log('🔍 Checking if diner_rewards table exists...');
    
    const { error: tableCheckError } = await supabase
      .from('diner_rewards')
      .select('count')
      .limit(1);

    if (tableCheckError) {
      console.error('❌ Table check error:', tableCheckError);
      return NextResponse.json(
        { 
          error: 'Database table not found',
          details: 'Please execute the database schema first',
          tableError: tableCheckError.message
        },
        { status: 500 }
      );
    }

    console.log('✅ diner_rewards table exists');

    // 检查是否已经有奖励记录
    const { data: existingReward, error: checkError } = await supabase
      .from('diner_rewards')
      .select('*')
      .eq('wallet_address', walletAddress.toLowerCase())
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Error checking existing rewards:', checkError);
      return NextResponse.json(
        { error: 'Database error', details: checkError.message },
        { status: 500 }
      );
    }

    if (existingReward) {
      console.log('⚠️ Reward already exists:', existingReward);
      return NextResponse.json(
        { 
          error: 'Reward already claimed',
          existingReward: existingReward
        },
        { status: 409 }
      );
    }

    // 创建奖励记录
    console.log('💾 Creating reward record...');
    
    const { data: rewardRecord, error: insertError } = await supabase
      .from('diner_rewards')
      .insert({
        wallet_address: walletAddress.toLowerCase(),
        email: email.toLowerCase(),
        reward_amount: 1000,
        reward_reason: 'New Diner Registration Bonus',
        status: 'pending',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ Insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to create reward record', details: insertError.message },
        { status: 500 }
      );
    }

    console.log('✅ Reward record created:', rewardRecord);

    // 检查环境变量
    const hasPrivateKey = !!process.env.MAIN_WALLET_PRIVATE_KEY;
    console.log('🔑 Private key configured:', hasPrivateKey);

    if (!hasPrivateKey) {
      console.log('⚠️ No private key configured, updating to mock completed status');
      
      // 更新为模拟完成状态
      const { error: updateError } = await supabase
        .from('diner_rewards')
        .update({
          status: 'completed',
          transaction_hash: `mock_test_tx_${Date.now()}`,
          completed_at: new Date().toISOString()
        })
        .eq('id', rewardRecord.id);

      if (updateError) {
        console.error('❌ Update error:', updateError);
      }

      return NextResponse.json({
        success: true,
        message: 'Test reward created (mock mode)',
        reward: rewardRecord,
        note: 'Configure MAIN_WALLET_PRIVATE_KEY for real token distribution'
      });
    }

    // 如果有私钥，尝试真实发放（将来实现）
    return NextResponse.json({
      success: true,
      message: 'Reward system ready',
      reward: rewardRecord,
      note: 'Ready for real token distribution'
    });

  } catch (error) {
    console.error('❌ Test reward API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Test Reward API',
    status: 'active',
    timestamp: new Date().toISOString()
  });
}
