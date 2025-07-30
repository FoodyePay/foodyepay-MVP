// app/api/paymaster/route.ts
// Foodye Paymaster JSON-RPC API Endpoint

import { NextRequest, NextResponse } from 'next/server';
import { FoodyePaymasterService, FOODYE_PAYMASTER_CONFIG } from '@/lib/paymasterService';

const PAYMASTER_URL = process.env.PAYMASTER_URL;
const paymasterService = new FoodyePaymasterService(FOODYE_PAYMASTER_CONFIG);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('🔥 Paymaster request:', body);

    // Check if this is a Foodye Coin specific request
    const { jsonrpc, id, method, params } = body;
    
    // Handle Foodye Coin Paymaster methods
    if (method && method.startsWith('pm_') && params && params[3]?.erc20) {
      const foodyeTokenAddress = FOODYE_PAYMASTER_CONFIG.foodyeTokenAddress.toLowerCase();
      const requestedToken = params[3].erc20.toLowerCase();
      
      if (requestedToken === foodyeTokenAddress) {
        return handleFoodyePaymaster(method, params, id);
      }
    }

    // Fallback to original Coinbase Paymaster for USDC/ETH
    if (!PAYMASTER_URL) {
      return NextResponse.json(
        { error: 'Paymaster URL not configured' },
        { status: 500 }
      );
    }

    // 转发请求到Coinbase Paymaster
    const response = await fetch(PAYMASTER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    
    console.log('🔥 Paymaster proxy response:', data);

    return NextResponse.json(data, { status: response.status });

  } catch (error) {
    console.error('Paymaster proxy error:', error);
    return NextResponse.json(
      { error: 'Paymaster request failed' },
      { status: 500 }
    );
  }
}

// Handle Foodye Coin Paymaster requests
async function handleFoodyePaymaster(method: string, params: any[], id: any) {
  try {
    let result;

    switch (method) {
      case 'pm_getAcceptedPaymentTokens':
        const [entryPoint, chainId, context] = params;
        result = await paymasterService.getAcceptedPaymentTokens(
          entryPoint,
          chainId,
          context
        );
        break;

      case 'pm_getPaymasterStubData':
        const [userOp1, entryPoint1, chainId1, context1] = params;
        result = await paymasterService.getPaymasterStubData(
          userOp1,
          entryPoint1,
          chainId1,
          context1
        );
        break;

      case 'pm_getPaymasterData':
        const [userOp2, entryPoint2, chainId2, context2] = params;
        result = await paymasterService.getPaymasterData(
          userOp2,
          entryPoint2,
          chainId2,
          context2
        );
        break;

      default:
        return NextResponse.json({
          jsonrpc: "2.0",
          id,
          error: {
            code: -32601,
            message: `Method not found: ${method}`
          }
        }, { status: 404 });
    }

    // Check if result is an error
    if ('code' in result && 'message' in result) {
      return NextResponse.json({
        jsonrpc: "2.0",
        id,
        error: result
      }, { status: 400 });
    }

    // Success response
    return NextResponse.json({
      jsonrpc: "2.0",
      id,
      result
    });

  } catch (error) {
    console.error('Foodye Paymaster error:', error);
    
    return NextResponse.json({
      jsonrpc: "2.0",
      id,
      error: {
        code: -32603,
        message: "Internal error"
      }
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    name: "Foodye Paymaster Service",
    version: "1.0.0",
    methods: [
      "pm_getAcceptedPaymentTokens",
      "pm_getPaymasterStubData", 
      "pm_getPaymasterData"
    ],
    supportedTokens: [
      {
        name: "Foodye Coin",
        address: FOODYE_PAYMASTER_CONFIG.foodyeTokenAddress,
        chainId: 8453 // Base
      }
    ],
    fallback: "Coinbase CDP Paymaster for USDC"
  });
}
