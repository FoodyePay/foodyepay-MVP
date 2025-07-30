// lib/foodyTokenService.ts

interface FoodyPrice {
  usd_price: number;
  foody_per_usd: number;
  last_updated: number;
  source: string;
}

// 模拟的 Foody Token 价格数据 (基于 dashboard-diner 中的真实 Swap 数据)
const MOCK_FOODY_PRICE: FoodyPrice = {
  usd_price: 0.0001030, // $0.0001030 per FOODY (来自实际 Swap: $129.02 / 1252524.66570 FOODY)
  foody_per_usd: 9708.737864, // 1 USD = ~9,708.74 FOODY
  last_updated: Date.now(),
  source: 'Coinbase_Swap_Real_Data'
};

/**
 * 获取 Foody Token 的当前价格
 */
export async function getFoodyPrice(): Promise<FoodyPrice> {
  try {
    // 1. 首先尝试从真实的 DEX 或价格 API 获取 (如果配置了)
    if (process.env.FOODY_PRICE_API_URL) {
      return await getFoodyPriceFromAPI();
    }
    
    // 2. 使用基于真实 Swap 数据的价格
    const currentPrice = {
      ...MOCK_FOODY_PRICE,
      last_updated: Date.now()
    };
    
    console.log('🪙 Using real Swap-based FOODY price:', currentPrice);
    return currentPrice;
    
  } catch (error) {
    console.error('Foody price lookup failed:', error);
    // 返回备用价格
    return MOCK_FOODY_PRICE;
  }
}

/**
 * 将 USDC 金额转换为 FOODY 数量
 */
export function convertUsdcToFoody(usdcAmount: number, foodyPrice: FoodyPrice): number {
  const foodyAmount = usdcAmount * foodyPrice.foody_per_usd;
  return Math.round(foodyAmount * 100000) / 100000; // 保留5位小数
}

/**
 * 将 FOODY 数量转换为 USDC 金额
 */
export function convertFoodyToUsdc(foodyAmount: number, foodyPrice: FoodyPrice): number {
  const usdcAmount = foodyAmount * foodyPrice.usd_price;
  return Math.round(usdcAmount * 100) / 100; // 保留2位小数
}

/**
 * 格式化 FOODY 数量显示
 */
export function formatFoodyAmount(amount: number): string {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(2)}M FOODY`;
  } else if (amount >= 1000) {
    return `${(amount / 1000).toFixed(2)}K FOODY`;
  } else {
    return `${amount.toFixed(2)} FOODY`;
  }
}

/**
 * 从外部 API 获取 Foody 价格 (当配置了时)
 */
async function getFoodyPriceFromAPI(): Promise<FoodyPrice> {
  const response = await fetch(process.env.FOODY_PRICE_API_URL!, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error(`Foody price API error: ${response.status}`);
  }
  
  const data = await response.json();
  
  return {
    usd_price: data.usd_price,
    foody_per_usd: 1 / data.usd_price,
    last_updated: Date.now(),
    source: 'External_API'
  };
}

/**
 * 计算含税总额的 FOODY 等值
 */
export function calculateFoodyPayment(
  subtotal: number, 
  taxAmount: number, 
  foodyPrice: FoodyPrice
): {
  subtotal_usdc: number;
  tax_usdc: number;
  total_usdc: number;
  subtotal_foody: number;
  tax_foody: number;
  total_foody: number;
  exchange_rate: number;
} {
  const totalUsdc = subtotal + taxAmount;
  
  return {
    subtotal_usdc: Math.round(subtotal * 100) / 100,
    tax_usdc: Math.round(taxAmount * 100) / 100,
    total_usdc: Math.round(totalUsdc * 100) / 100,
    subtotal_foody: convertUsdcToFoody(subtotal, foodyPrice),
    tax_foody: convertUsdcToFoody(taxAmount, foodyPrice),
    total_foody: convertUsdcToFoody(totalUsdc, foodyPrice),
    exchange_rate: foodyPrice.foody_per_usd
  };
}
