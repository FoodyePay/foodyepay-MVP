// lib/foodyTokenService.ts
// FOODY 代币转账服务（主钱包发放）

import { createWalletClient, createPublicClient, http, parseEther, formatEther } from 'viem';
import { base } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

// FOODY 代币合约信息
export const FOODY_TOKEN_CONFIG = {
  address: '0x1022b1b028a2237c440dbac51dc6fc220d88c08f' as const,
  decimals: 18,
  symbol: 'FOODY',
  name: 'Foodye Coin',
  chainId: 8453, // Base Mainnet
};

// 主钱包配置（有大量FOODY代币的钱包）
export const MAIN_WALLET_CONFIG = {
  address: '0xB4ffaAc40f4cA6ECb006AE6d739262f1458b64a3' as const,
};

// 发放钱包配置（有私钥，用于实际发放）
export const DISTRIBUTION_WALLET_CONFIG = {
  address: '0xf631E5EBad5E99A221048D6994679E5fc446b66B' as const,
  // 私钥从环境变量获取
  privateKey: process.env.MAIN_WALLET_PRIVATE_KEY as `0x${string}`,
};

// ERC-20 代币合约 ABI（仅包含需要的函数）
const ERC20_ABI = [
  {
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const;

/**
 * 获取钱包客户端
 */
function getWalletClient() {
  if (!DISTRIBUTION_WALLET_CONFIG.privateKey) {
    throw new Error('MAIN_WALLET_PRIVATE_KEY not configured in environment variables');
  }

  const account = privateKeyToAccount(DISTRIBUTION_WALLET_CONFIG.privateKey);
  
  return createWalletClient({
    account,
    chain: base,
    transport: http(process.env.NEXT_PUBLIC_RPC_URL || 'https://mainnet.base.org')
  });
}

/**
 * 获取公共客户端（用于读取操作）
 */
function getPublicClient() {
  return createPublicClient({
    chain: base,
    transport: http(process.env.NEXT_PUBLIC_RPC_URL || 'https://mainnet.base.org')
  });
}

/**
 * 检查主钱包 FOODY 代币余额
 */
export async function checkMainWalletBalance(): Promise<{
  balance: bigint;
  formattedBalance: string;
  canDistribute: boolean;
  maxRewards: number;
}> {
  try {
    const client = getPublicClient();
    
    // 读取代币余额
    const balance = await client.readContract({
      address: FOODY_TOKEN_CONFIG.address,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [MAIN_WALLET_CONFIG.address]
    });

  const formattedBalance = formatEther(balance);
  const rewardAmount = 888; // 每次奖励 888 FOODY（平台注册奖励）
    const maxRewards = Math.floor(Number(formattedBalance) / rewardAmount);

    return {
      balance,
      formattedBalance,
      canDistribute: balance >= parseEther(rewardAmount.toString()),
      maxRewards
    };
  } catch (error) {
    console.error('Error checking main wallet balance:', error);
    throw new Error(`Failed to check wallet balance: ${error}`);
  }
}

/**
 * 检查发放钱包 FOODY 代币余额
 */
export async function checkDistributionWalletBalance(): Promise<{
  balance: bigint;
  formattedBalance: string;
  canDistribute: boolean;
  maxRewards: number;
}> {
  try {
    const client = getPublicClient();
    
    // 读取代币余额
    const balance = await client.readContract({
      address: FOODY_TOKEN_CONFIG.address,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [DISTRIBUTION_WALLET_CONFIG.address]
    });

  const formattedBalance = formatEther(balance);
  const rewardAmount = 888; // 每次奖励 888 FOODY（平台注册奖励）
    const maxRewards = Math.floor(Number(formattedBalance) / rewardAmount);

    return {
      balance,
      formattedBalance,
      canDistribute: balance >= parseEther(rewardAmount.toString()),
      maxRewards
    };
  } catch (error) {
    console.error('Error checking distribution wallet balance:', error);
    throw new Error(`Failed to check distribution wallet balance: ${error}`);
  }
}

/**
 * 从主钱包发送 FOODY 代币到指定地址
 */
export async function distributeFoodyTokens(
  recipientAddress: string,
  amount: number
): Promise<{
  success: boolean;
  transactionHash?: string;
  error?: string;
}> {
  try {
    // 验证输入
    if (!recipientAddress || !/^0x[a-fA-F0-9]{40}$/.test(recipientAddress)) {
      throw new Error('Invalid recipient address');
    }

    if (amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }

    // 检查发放钱包余额
    const distributionWalletBalance = await checkDistributionWalletBalance();
    if (!distributionWalletBalance.canDistribute) {
      throw new Error(`Insufficient balance in distribution wallet. Current: ${distributionWalletBalance.formattedBalance} FOODY, Required: ${amount} FOODY`);
    }

    console.log(`💰 Distributing ${amount} FOODY from distribution wallet (${DISTRIBUTION_WALLET_CONFIG.address}) to ${recipientAddress}`);
    console.log(`📊 Distribution wallet balance: ${distributionWalletBalance.formattedBalance} FOODY`);

    const client = getWalletClient();
    
    // 转换金额到 wei 单位
    const amountInWei = parseEther(amount.toString());

    // 执行代币转账
    const txHash = await client.writeContract({
      address: FOODY_TOKEN_CONFIG.address,
      abi: ERC20_ABI,
      functionName: 'transfer',
      args: [recipientAddress as `0x${string}`, amountInWei]
    });

    console.log(`✅ Transaction sent: ${txHash}`);
    console.log(`🔗 View on BaseScan: https://basescan.org/tx/${txHash}`);

    return {
      success: true,
      transactionHash: txHash
    };

  } catch (error: unknown) {
    console.error('❌ Error distributing FOODY tokens:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * 批量发放 FOODY 代币（气体优化版本）
 */
export async function batchDistributeFoodyTokens(
  recipients: Array<{ address: string; amount: number }>
): Promise<{
  success: boolean;
  results: Array<{ address: string; success: boolean; txHash?: string; error?: string }>;
  totalDistributed: number;
}> {
  const results: Array<{ address: string; success: boolean; txHash?: string; error?: string }> = [];
  let totalDistributed = 0;

  console.log(`🎯 Starting batch distribution to ${recipients.length} recipients`);

  // 检查主钱包余额
  const totalRequired = recipients.reduce((sum, r) => sum + r.amount, 0);
  const balanceInfo = await checkMainWalletBalance();
  
  if (Number(balanceInfo.formattedBalance) < totalRequired) {
    return {
      success: false,
      results: recipients.map(r => ({
        address: r.address,
        success: false,
        error: 'Insufficient main wallet balance for batch operation'
      })),
      totalDistributed: 0
    };
  }

  // 逐一发放（在生产环境中可考虑使用 Multicall 优化）
  for (const recipient of recipients) {
    try {
      const result = await distributeFoodyTokens(recipient.address, recipient.amount);
      
      results.push({
        address: recipient.address,
        success: result.success,
        txHash: result.transactionHash,
        error: result.error
      });

      if (result.success) {
        totalDistributed += recipient.amount;
      }

      // 添加小延迟避免 RPC 限制
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (error: unknown) {
      results.push({
        address: recipient.address,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  }

  const successCount = results.filter(r => r.success).length;
  console.log(`📊 Batch complete: ${successCount}/${recipients.length} successful, ${totalDistributed} FOODY distributed`);

  return {
    success: successCount > 0,
    results,
    totalDistributed
  };
}

/**
 * 发放 Diner 注册奖励的便捷函数
 */
export async function distributeDinerRegistrationReward(
  walletAddress: string
): Promise<{
  success: boolean;
  transactionHash?: string;
  error?: string;
  amount: number;
}> {
  const rewardAmount = 888; // 888 FOODY 奖励（平台奖励）

  console.log(`🎁 Distributing Diner registration reward: ${rewardAmount} FOODY to ${walletAddress}`);

  // 检查是否配置了私钥
  if (!process.env.MAIN_WALLET_PRIVATE_KEY) {
    console.log('⚠️ No private key configured, returning mock success');
    return {
      success: true,
      transactionHash: `mock_reward_${Date.now()}`,
      amount: rewardAmount
    };
  }

  const result = await distributeFoodyTokens(walletAddress, rewardAmount);

  return {
    ...result,
    amount: rewardAmount
  };
}

/**
 * 获取代币信息和主钱包状态
 */
export async function getTokenDistributionInfo(): Promise<{
  tokenInfo: typeof FOODY_TOKEN_CONFIG;
  mainWallet: {
    address: string;
    privateKey: string;
  };
  balance: {
    raw: bigint;
    formatted: string;
    canDistribute: boolean;
    maxRewards: number;
  };
  network: {
    chainId: number;
    name: string;
    explorer: string;
  };
}> {
  const balanceInfo = await checkMainWalletBalance();

  return {
    tokenInfo: FOODY_TOKEN_CONFIG,
    mainWallet: {
      address: MAIN_WALLET_CONFIG.address,
      privateKey: '[REDACTED]' // 安全考虑，不返回私钥
    },
    balance: {
      raw: balanceInfo.balance,
      formatted: balanceInfo.formattedBalance,
      canDistribute: balanceInfo.canDistribute,
      maxRewards: balanceInfo.maxRewards
    },
    network: {
      chainId: 8453,
      name: 'Base Mainnet',
      explorer: 'https://basescan.org'
    }
  };
}
