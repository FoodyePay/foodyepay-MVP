import { NextResponse } from 'next/server';

// 修复：移除未使用的 request 参数
export async function GET() {
  try {
    // Test EIN validation
    const testEins = [
      '12-3456789',  // Valid format
      '123456789',   // Valid format without dash
      '12-34567',    // Invalid (too short)
      'ABCD12345',   // Invalid (contains letters)
      ''             // Invalid (empty)
    ];

    const results = testEins.map(ein => ({
      ein,
      isValid: validateEinFormat(ein),
      formatted: formatEin(ein)
    }));

    return NextResponse.json({
      success: true,
      test_results: results,
      message: 'EIN validation test completed'
    });

  } catch (error) {
    console.error('EIN test error:', error);
    return NextResponse.json(
      { 
        error: 'EIN test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function validateEinFormat(ein: string): boolean {
  if (!ein) return false;
  
  // Remove any non-numeric characters except dash
  const cleaned = ein.replace(/[^0-9-]/g, '');
  
  // Check if it matches XX-XXXXXXX or XXXXXXXXX format
  const einRegex = /^(\d{2}-?\d{7})$/;
  return einRegex.test(cleaned) && cleaned.length >= 9;
}

function formatEin(ein: string): string {
  if (!ein) return '';
  
  const cleaned = ein.replace(/[^0-9]/g, '');
  if (cleaned.length === 9) {
    return `${cleaned.slice(0, 2)}-${cleaned.slice(2)}`;
  }
  return ein;
}
