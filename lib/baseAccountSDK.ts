// lib/baseAccountSDK.ts
// Base Account SDK 配置和Paymaster集成

import { createBaseAccountSDK, base } from '@base-org/account';

// 创建Base Account SDK实例
export const sdk = createBaseAccountSDK({
  appName: 'FoodyePay',
  appLogoUrl: '/FoodyePayLogo.png',
  appChainIds: [base.constants.CHAIN_IDS.base], // Base Mainnet
});

// 获取provider
export const provider = sdk.getProvider();

// Paymaster配置
export const PAYMASTER_CONFIG = {
  // 使用本地代理URL保护真实的Paymaster URL
  url: process.env.NODE_ENV === 'production' 
    ? '/api/paymaster'  // 生产环境使用代理
    : '/api/paymaster', // 开发环境也使用代理
};

/**
 * 检查钱包是否支持Paymaster功能
 */
export async function checkPaymasterCapabilities(address: string): Promise<boolean> {
  try {
    const capabilities = await provider.request({
      method: 'wallet_getCapabilities',
      params: [address]
    }) as Record<string, any>;

    const baseCapabilities = capabilities[base.constants.CHAIN_IDS.base];
    return baseCapabilities?.paymasterService?.supported || false;

  } catch (error) {
    console.error('Failed to check paymaster capabilities:', error);
    return false;
  }
}

/**
 * 发送带Paymaster赞助的交易
 */
export async function sendSponsoredTransaction(
  from: string,
  calls: Array<{
    to: string;
    value: string;
    data: string;
  }>
) {
  try {
    const result = await provider.request({
      method: 'wallet_sendCalls',
      params: [{
        version: '1.0',
        chainId: `0x${base.constants.CHAIN_IDS.base.toString(16)}`,
        from,
        calls,
        capabilities: {
          paymasterService: PAYMASTER_CONFIG
        }
      }]
    });

    console.log('🎉 Sponsored transaction sent:', result);
    return result;

  } catch (error) {
    console.error('Sponsored transaction failed:', error);
    throw error;
  }
}
