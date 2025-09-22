// app/api/setup-database/route.ts
// 数据库快速设置 API

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST() {
  try {
    console.log('🔧 Setting up diner_rewards table...');

    // 创建 diner_rewards 表
    const { error: createTableError } = await supabase.rpc('create_diner_rewards_table');

    if (createTableError) {
      console.log('⚠️ RPC function not found, trying direct SQL...');
      
      // 如果 RPC 函数不存在，直接执行 SQL
      const createTableSQL = `
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

        CREATE INDEX IF NOT EXISTS idx_diner_rewards_wallet ON diner_rewards(wallet_address);
        CREATE INDEX IF NOT EXISTS idx_diner_rewards_status ON diner_rewards(status);
      `;

      // 注意：在生产环境中不应该这样直接执行 SQL
      // 这里只是为了快速设置开发环境
      console.log('📝 Please execute this SQL in your Supabase dashboard:');
      console.log(createTableSQL);

      return NextResponse.json({
        success: false,
        message: 'Table creation requires manual setup',
        sql: createTableSQL,
        instructions: [
          '1. 登录您的 Supabase 项目',
          '2. 进入 SQL Editor',
          '3. 执行上面的 SQL 脚本',
          '4. 重新测试奖励系统'
        ]
      });
    }

    console.log('✅ Database table created successfully');

    // 为 ken2 和 foodyepay@gmail.com 创建测试奖励
    const testRewards = [
      {
        wallet_address: '0x958a16ada1b69db030e905aaa3f637c7bd4344a7',
        email: 'ken2@gmail.com',
  reward_amount: 888,
        status: 'completed',
        transaction_hash: 'mock_reward_ken2',
        completed_at: new Date().toISOString()
      },
      {
        wallet_address: '0xb4ffaac40f4ca6ecb006ae6d739262f1458b64a3',
        email: 'foodyepay@gmail.com',
  reward_amount: 888,
        status: 'completed',
        transaction_hash: 'mock_reward_foodyepay',
        completed_at: new Date().toISOString()
      }
    ];

    for (const reward of testRewards) {
      const { error: insertError } = await supabase
        .from('diner_rewards')
        .insert(reward)
        .select();

      if (insertError && insertError.code !== '23505') { // 忽略重复键错误
        console.error('Insert error:', insertError);
      } else {
        console.log(`✅ Created reward for ${reward.email}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Database setup completed',
      rewardsCreated: testRewards.length
    });

  } catch (error) {
    console.error('❌ Database setup error:', error);
    return NextResponse.json(
      { 
        error: 'Database setup failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        manualSetupSQL: `
          -- 在 Supabase SQL Editor 中执行：
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

          CREATE INDEX IF NOT EXISTS idx_diner_rewards_wallet ON diner_rewards(wallet_address);
          CREATE INDEX IF NOT EXISTS idx_diner_rewards_status ON diner_rewards(status);

          -- 插入测试奖励数据
          INSERT INTO diner_rewards (wallet_address, email, reward_amount, status, transaction_hash, completed_at) 
          VALUES 
            ('0x958a16ada1b69db030e905aaa3f637c7bd4344a7', 'ken2@gmail.com', 888, 'completed', 'mock_reward_ken2', NOW()),
            ('0xb4ffaac40f4ca6ecb006ae6d739262f1458b64a3', 'foodyepay@gmail.com', 888, 'completed', 'mock_reward_foodyepay', NOW())
          ON CONFLICT (wallet_address) DO NOTHING;
        `
      },
      { status: 500 }
    );
  }
}
