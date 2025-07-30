import { NextRequest, NextResponse } from 'next/server';

// 🧪 Mock EIN database for development/testing
const MOCK_EIN_DATABASE: Record<string, string> = {
  '93-4482803': 'FAN SZECHUAN CUISINE INC.',
  '12-3456789': 'McDonald\'s Corporation',
  '23-4567890': 'Subway Restaurants LLC',
  '34-5678901': 'KFC Corporation',
  '45-6789012': 'Pizza Hut LLC',
  '56-7890123': 'Domino\'s Pizza Inc',
  '77-1234567': 'Starbucks Corporation',
  '88-9876543': 'Chipotle Mexican Grill Inc'
};

export async function POST(request: NextRequest) {
  try {
    const { ein, restaurantName } = await request.json();

    if (!ein || !restaurantName) {
      return NextResponse.json(
        { 
          valid: false,
          error: 'EIN and restaurant name are required' 
        },
        { status: 400 }
      );
    }

    // Format EIN for lookup
    const formattedEin = ein.replace(/\D/g, '').slice(0, 9);
    const einWithDash = `${formattedEin.slice(0, 2)}-${formattedEin.slice(2)}`;
    
    if (formattedEin.length !== 9) {
      return NextResponse.json({
        valid: false, 
        error: 'Invalid EIN format. Must be 9 digits.' 
      });
    }

    console.log('🔍 EIN Verification Request:', { ein: einWithDash, restaurantName });

    // For now, always use mock verification
    // When Abound Live access is enabled, you can switch this
    const useRealAPI = false; // process.env.ABOUND_API_KEY && process.env.NODE_ENV === 'production';
    
    if (useRealAPI) {
      // Real Abound API call would go here
      return NextResponse.json({
        valid: false,
        error: 'Real API not yet enabled'
      });
    } else {
      // 🧪 Use mock verification for development
      return mockEINVerification(einWithDash, restaurantName);
    }

  } catch (error) {
    console.error('EIN verification error:', error);
    return NextResponse.json({
      valid: false,
      error: 'Internal server error' 
    });
  }
}

// 🧪 Mock EIN verification function
function mockEINVerification(ein: string, restaurantName: string) {
  console.log('🧪 Using MOCK EIN verification');
  
  const registeredName = MOCK_EIN_DATABASE[ein];
  
  if (!registeredName) {
    return NextResponse.json({
      valid: false,
      error: 'EIN not found in IRS records'
    });
  }

  // Fuzzy name matching
  const normalizedInput = restaurantName.toLowerCase().trim();
  const normalizedRegistered = registeredName.toLowerCase().trim();
  
  const isMatch = 
    normalizedInput === normalizedRegistered ||
    normalizedInput.includes(normalizedRegistered.split(' ')[0]) ||
    normalizedRegistered.includes(normalizedInput.split(' ')[0]) ||
    // Handle common business suffixes
    normalizedInput.replace(/\s+(llc|inc|corp|corporation|ltd|limited)$/i, '') === 
    normalizedRegistered.replace(/\s+(llc|inc|corp|corporation|ltd|limited)$/i, '');

  if (!isMatch) {
    return NextResponse.json({
      valid: false,
      error: 'Restaurant name does not match EIN records',
      registeredName: registeredName
    });
  }

  // Success response
  return NextResponse.json({
    valid: true,
    registeredName: registeredName,
    ein: ein,
    businessType: 'Corporation',
    verificationMethod: 'MOCK_DATABASE'
  });
}
