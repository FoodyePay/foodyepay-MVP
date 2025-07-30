// utils/verifyEIN.ts
export interface EINVerificationResult {
  valid: boolean;
  error?: string;
  registeredName?: string;
  businessType?: string;
  address?: any;
  ein?: string;
}

export async function verifyEIN(ein: string, restaurantName: string): Promise<EINVerificationResult> {
  try {
    console.log('🔍 Starting EIN verification:', { ein, restaurantName });
    
    const response = await fetch('/api/verify-ein', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ein: ein,
        restaurantName: restaurantName
      })
    });

    console.log('📡 API response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('❌ API response error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorData
      });
      
      return {
        valid: false,
        error: errorData.error || `HTTP ${response.status}: ${response.statusText}`
      };
    }

    const result = await response.json();
    console.log('✅ EIN verification result:', result);
    
    return result;
  } catch (error) {
    console.error('💥 EIN verification network error:', error);
    return {
      valid: false,
      error: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

export function formatEIN(value: string): string {
  // Remove all non-digits
  const digits = value.replace(/\D/g, '');
  
  // Format as XX-XXXXXXX
  if (digits.length >= 2) {
    return digits.slice(0, 2) + '-' + digits.slice(2, 9);
  }
  
  return digits;
}

export function validateEINFormat(ein: string): boolean {
  const einPattern = /^\d{2}-\d{7}$/;
  return einPattern.test(ein);
}
