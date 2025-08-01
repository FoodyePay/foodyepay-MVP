// app/api/test-real-token/route.ts
// 测试真实FOODY代币发放的API


// Import Next.js API types and token distribution utilities
import { NextRequest, NextResponse } from 'next/server';
import { distributeFoodyTokens, checkMainWalletBalance } from '@/lib/foodyTokenDistribution';


// POST endpoint: Test real FOODY token distribution
// Expects JSON body: { walletAddress: string, amount: number }
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const { walletAddress, amount } = await request.json();

    // Validate input
    if (!walletAddress || !amount) {
      return NextResponse.json(
        { error: 'Wallet address and amount are required' },
        { status: 400 }
      );
    }

    // Log the test distribution attempt
    console.log(`Testing real token distribution: ${amount} FOODY to ${walletAddress}`);

    // Call the token distribution function
    const result = await distributeFoodyTokens(walletAddress, amount);

    // Return the result of the distribution
    return NextResponse.json({
      success: true,
      testMode: true,
      result: result,
      message: result.success 
        ? `Successfully distributed ${amount} FOODY tokens!`
        : `Failed to distribute tokens: ${result.error}`
    });

  } catch (error) {
    // Handle unexpected errors
    console.error('Test real token distribution error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}


// GET endpoint: Check main wallet balance (action=balance)
export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    // If action is 'balance', return main wallet balance info
    if (action === 'balance') {
      console.log('Checking main wallet balance...');
      
      // Call the balance check function
      const balanceResult = await checkMainWalletBalance();

      // Return balance details
      return NextResponse.json({
        success: true,
        mainWalletBalance: {
          balance: balanceResult.balance.toString(),
          formattedBalance: balanceResult.formattedBalance,
          canDistribute: balanceResult.canDistribute,
          maxRewards: balanceResult.maxRewards
        },
        message: `Main wallet has ${balanceResult.formattedBalance} FOODY tokens. Can distribute: ${balanceResult.canDistribute ? 'Yes' : 'No'}. Max rewards possible: ${balanceResult.maxRewards}`
      });
    }

    // If action is not recognized, return error
    return NextResponse.json(
      { error: 'Invalid action parameter' },
      { status: 400 }
    );

  } catch (error) {
    // Handle unexpected errors
    console.error('Test API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
