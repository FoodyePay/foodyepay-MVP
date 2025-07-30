import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const useRealAPI = process.env.ABOUND_API_KEY && process.env.NODE_ENV === 'production';
  
  return NextResponse.json({
    status: 'ok',
    message: 'EIN API test endpoint',
    mode: useRealAPI ? 'REAL_API' : 'MOCK_MODE',
    apiKeyConfigured: !!process.env.ABOUND_API_KEY,
    appIdConfigured: !!process.env.ABOUND_APP_ID,
    nodeEnv: process.env.NODE_ENV,
    availableTestEINs: [
      '93-4482803 → FAN SZECHUAN CUISINE INC.',
      '12-3456789 → McDonald\'s Corporation',
      '23-4567890 → Subway Restaurants LLC'
    ],
    timestamp: new Date().toISOString()
  });
}

export async function POST(request: NextRequest) {
  try {
    const { ein, restaurantName } = await request.json();
    
    return NextResponse.json({
      received: { ein, restaurantName },
      apiKeyConfigured: !!process.env.ABOUND_API_KEY,
      appIdConfigured: !!process.env.ABOUND_APP_ID,
      formattedEin: ein?.replace(/\D/g, '').slice(0, 9),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
