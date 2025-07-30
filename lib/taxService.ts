// lib/taxService.ts
import { NextResponse } from 'next/server';

interface TaxRate {
  rate: number;
  state_rate: number;
  county_rate: number;
  city_rate: number;
  combined_district_rate: number;
  total_rate: number;
}

interface TaxCalculation {
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  tax_rate: number;
  zip_code: string;
  state: string;
}

// 模拟税率数据库 (基于真实美国税率)
const MOCK_TAX_RATES: Record<string, TaxRate> = {
  // New York
  '10001': { // Manhattan
    rate: 0.08,
    state_rate: 0.04,
    county_rate: 0.0125,
    city_rate: 0.04375,
    combined_district_rate: 0,
    total_rate: 0.08875
  },
  '10002': { // Lower East Side
    rate: 0.08,
    state_rate: 0.04,
    county_rate: 0.0125,
    city_rate: 0.04375,
    combined_district_rate: 0,
    total_rate: 0.08875
  },
  '11101': { // Queens
    rate: 0.08,
    state_rate: 0.04,
    county_rate: 0.0125,
    city_rate: 0.04375,
    combined_district_rate: 0,
    total_rate: 0.08875
  },
  
  // California
  '90210': { // Beverly Hills
    rate: 0.0975,
    state_rate: 0.0725,
    county_rate: 0.0025,
    city_rate: 0,
    combined_district_rate: 0.0225,
    total_rate: 0.0975
  },
  '94102': { // San Francisco
    rate: 0.08625,
    state_rate: 0.0725,
    county_rate: 0.0025,
    city_rate: 0,
    combined_district_rate: 0.01125,
    total_rate: 0.08625
  },
  
  // Texas
  '75201': { // Dallas
    rate: 0.0825,
    state_rate: 0.0625,
    county_rate: 0,
    city_rate: 0.02,
    combined_district_rate: 0,
    total_rate: 0.0825
  },
  
  // Illinois
  '60601': { // Chicago
    rate: 0.1025,
    state_rate: 0.0625,
    county_rate: 0.0175,
    city_rate: 0.0125,
    combined_district_rate: 0.01,
    total_rate: 0.1025
  },
  
  // Florida (no state income tax, but has sales tax)
  '33101': { // Miami
    rate: 0.08,
    state_rate: 0.06,
    county_rate: 0.01,
    city_rate: 0.01,
    combined_district_rate: 0,
    total_rate: 0.08
  },
  
  // 默认税率
  'default': {
    rate: 0.0725,
    state_rate: 0.0625,
    county_rate: 0.01,
    city_rate: 0,
    combined_district_rate: 0,
    total_rate: 0.0725
  }
};

/**
 * 根据邮政编码获取税率
 */
export async function getTaxRateByZipCode(zipCode: string): Promise<TaxRate> {
  try {
    // 1. 首先尝试使用 TaxJar API (如果配置了)
    if (process.env.TAXJAR_API_KEY && process.env.NODE_ENV === 'production') {
      return await getTaxRateFromTaxJar(zipCode);
    }
    
    // 2. 使用模拟数据
    const normalizedZip = zipCode.slice(0, 5); // 只取前5位
    const taxRate = MOCK_TAX_RATES[normalizedZip] || MOCK_TAX_RATES['default'];
    
    console.log(`🧮 Using mock tax rate for ${zipCode}:`, taxRate);
    return taxRate;
    
  } catch (error) {
    console.error('Tax rate lookup failed:', error);
    // 返回默认税率
    return MOCK_TAX_RATES['default'];
  }
}

/**
 * 计算税费
 */
export function calculateTax(subtotal: number, zipCode: string, taxRate: TaxRate): TaxCalculation {
  const tax_amount = subtotal * taxRate.total_rate;
  const total_amount = subtotal + tax_amount;
  
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    tax_amount: Math.round(tax_amount * 100) / 100,
    total_amount: Math.round(total_amount * 100) / 100,
    tax_rate: taxRate.total_rate,
    zip_code: zipCode,
    state: getStateFromZip(zipCode)
    // 移除 city 和 county 信息
  };
}

/**
 * 真实 TaxJar API 调用 (当配置了 API Key 时)
 */
async function getTaxRateFromTaxJar(zipCode: string): Promise<TaxRate> {
  const response = await fetch(`https://api.taxjar.com/v2/rates/${zipCode}`, {
    headers: {
      'Authorization': `Bearer ${process.env.TAXJAR_API_KEY}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error(`TaxJar API error: ${response.status}`);
  }
  
  const data = await response.json();
  const rate = data.rate;
  
  return {
    rate: rate.combined_rate,
    state_rate: rate.state_rate,
    county_rate: rate.county_rate,
    city_rate: rate.city_rate,
    combined_district_rate: rate.combined_district_rate,
    total_rate: rate.combined_rate
  };
}

/**
 * 根据邮政编码获取州名 (简化版)
 */
function getStateFromZip(zipCode: string): string {
  const zip = zipCode.slice(0, 5);
  
  // 简化的州映射
  if (zip.startsWith('1')) return 'NY'; // New York
  if (zip.startsWith('9')) return 'CA'; // California
  if (zip.startsWith('7')) return 'TX'; // Texas
  if (zip.startsWith('6')) return 'IL'; // Illinois
  if (zip.startsWith('3')) return 'FL'; // Florida
  
  return 'Unknown';
}

/**
 * 根据邮政编码获取城市名 (简化版)
 */
function getCityFromZip(zipCode: string): string | undefined {
  const cityMap: Record<string, string> = {
    '10001': 'New York',
    '10002': 'New York',
    '11101': 'Long Island City',
    '90210': 'Beverly Hills',
    '94102': 'San Francisco',
    '75201': 'Dallas',
    '60601': 'Chicago',
    '33101': 'Miami'
  };
  
  return cityMap[zipCode.slice(0, 5)];
}

/**
 * 根据邮政编码获取县名 (简化版)
 */
function getCountyFromZip(zipCode: string): string | undefined {
  const countyMap: Record<string, string> = {
    '10001': 'New York County',
    '10002': 'New York County',
    '11101': 'Queens County',
    '90210': 'Los Angeles County',
    '94102': 'San Francisco County',
    '75201': 'Dallas County',
    '60601': 'Cook County',
    '33101': 'Miami-Dade County'
  };
  
  return countyMap[zipCode.slice(0, 5)];
}
