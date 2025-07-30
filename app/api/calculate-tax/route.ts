// app/api/calculate-tax/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getTaxRateByZipCode, calculateTax } from '@/lib/taxService';

export async function POST(request: NextRequest) {
  try {
    const { amount, zipCode } = await request.json();

    if (!amount || !zipCode) {
      return NextResponse.json(
        { error: 'Amount and zip code are required' },
        { status: 400 }
      );
    }

    // 验证金额
    const subtotal = parseFloat(amount);
    if (isNaN(subtotal) || subtotal <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    // 验证邮政编码
    const zipPattern = /^\d{5}(-\d{4})?$/;
    if (!zipPattern.test(zipCode)) {
      return NextResponse.json(
        { error: 'Invalid zip code format' },
        { status: 400 }
      );
    }

    console.log(`🧮 Calculating tax for amount: ${subtotal}, zip: ${zipCode}`);

    // 获取税率
    const taxRate = await getTaxRateByZipCode(zipCode);
    
    // 计算税费
    const taxCalculation = calculateTax(subtotal, zipCode, taxRate);

    return NextResponse.json({
      success: true,
      ...taxCalculation,
      api_used: process.env.TAXJAR_API_KEY ? 'TaxJar' : 'Mock'
    });

  } catch (error) {
    console.error('Tax calculation error:', error);
    return NextResponse.json(
      { 
        error: 'Tax calculation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const zipCode = searchParams.get('zip');

  if (!zipCode) {
    return NextResponse.json(
      { error: 'Zip code parameter is required' },
      { status: 400 }
    );
  }

  try {
    const taxRate = await getTaxRateByZipCode(zipCode);
    
    return NextResponse.json({
      success: true,
      zip_code: zipCode,
      tax_rate: taxRate.total_rate,
      api_used: process.env.TAXJAR_API_KEY ? 'TaxJar' : 'Mock'
    });

  } catch (error) {
    console.error('Tax rate lookup error:', error);
    return NextResponse.json(
      { 
        error: 'Tax rate lookup failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
