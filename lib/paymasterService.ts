// lib/paymasterService.ts
// Foodye Coin Paymaster Service - ERC-7677 Compatible

// 暂时注释掉 ethers，使用浏览器内置的方法
// import { ethers } from 'ethers';

export interface PaymasterConfig {
  paymasterAddress: string;
  foodyeTokenAddress: string;
  entryPointAddress: string;
  exchangeRate: number; // 1 ETH = X FOODYE
  rpcUrl: string;
  privateKey: string;
}

export interface UserOperation {
  sender: string;
  nonce: string;
  initCode: string;
  callData: string;
  callGasLimit: string;
  verificationGasLimit: string;
  preVerificationGas: string;
  maxFeePerGas: string;
  maxPriorityFeePerGas: string;
  paymasterAndData: string;
  signature: string;
}

export interface PaymasterResult {
  paymasterAndData: string;
  tokenPayment?: {
    name: string;
    address: string;
    maxFee: string;
    decimals: number;
  };
}

export interface PaymasterError {
  code: number;
  message: string;
  data?: {
    acceptedTokens: Array<{
      name: string;
      address: string;
    }>;
    paymasterAddress?: string;
  };
}

export class FoodyePaymasterService {
  private config: PaymasterConfig;
  
  constructor(config: PaymasterConfig) {
    this.config = config;
  }

  /**
   * ERC-7677: Get accepted payment tokens
   */
  async getAcceptedPaymentTokens(
    entryPoint: string,
    chainId: string,
    context?: any
  ): Promise<{ acceptedTokens: Array<{ name: string; address: string }> }> {
    return {
      acceptedTokens: [
        {
          name: "Foodye Coin",
          address: this.config.foodyeTokenAddress
        }
      ]
    };
  }

  /**
   * ERC-7677: Get paymaster stub data for gas estimation
   */
  async getPaymasterStubData(
    userOp: UserOperation,
    entryPoint: string,
    chainId: string,
    context?: { erc20?: string }
  ): Promise<PaymasterResult | PaymasterError> {
    // Check if requesting Foodye token payment
    if (context?.erc20 && context.erc20.toLowerCase() !== this.config.foodyeTokenAddress.toLowerCase()) {
      return this.createRejectionError();
    }

    try {
      // Estimate gas cost
      const gasCost = await this.estimateGasCost(userOp);
      const foodyeAmount = this.calculateFoodyeAmount(gasCost);

      // Check user balance and allowance
      const hasBalance = await this.checkUserBalance(userOp.sender, foodyeAmount);
      const hasAllowance = await this.checkUserAllowance(userOp.sender, foodyeAmount);

      if (!hasBalance || !hasAllowance) {
        return this.createRejectionError();
      }

      // Return stub data
      return {
        paymasterAndData: this.generatePaymasterAndData(userOp, gasCost),
        tokenPayment: {
          name: "Foodye Coin",
          address: this.config.foodyeTokenAddress,
          maxFee: `0x${foodyeAmount.toString(16)}`,
          decimals: 18
        }
      };
    } catch (error) {
      return this.createRejectionError();
    }
  }

  /**
   * ERC-7677: Get actual paymaster data
   */
  async getPaymasterData(
    userOp: UserOperation,
    entryPoint: string,
    chainId: string,
    context?: { erc20?: string }
  ): Promise<PaymasterResult | PaymasterError> {
    // Same logic as stub data but with actual signing
    return this.getPaymasterStubData(userOp, entryPoint, chainId, context);
  }

  /**
   * Estimate gas cost for user operation
   */
  private async estimateGasCost(userOp: UserOperation): Promise<number> {
    const callGasLimit = parseInt(userOp.callGasLimit, 16);
    const verificationGasLimit = parseInt(userOp.verificationGasLimit, 16);
    const preVerificationGas = parseInt(userOp.preVerificationGas, 16);
    const maxFeePerGas = parseInt(userOp.maxFeePerGas, 16);

    const totalGas = callGasLimit + verificationGasLimit + preVerificationGas;
    return totalGas * maxFeePerGas;
  }

  /**
   * Calculate required Foodye amount for gas cost
   */
  private calculateFoodyeAmount(gasCostInWei: number): number {
    // Convert wei to ETH, then to Foodye tokens
    const ethAmount = gasCostInWei / 1e18;
    return Math.ceil(ethAmount * this.config.exchangeRate);
  }

  /**
   * Check if user has sufficient Foodye balance
   */
  private async checkUserBalance(userAddress: string, requiredAmount: number): Promise<boolean> {
    try {
      // 简化版本，实际项目中需要调用区块链
      return true; // 暂时返回 true，部署后再实现真实逻辑
    } catch {
      return false;
    }
  }

  /**
   * Check if user has sufficient allowance
   */
  private async checkUserAllowance(userAddress: string, requiredAmount: number): Promise<boolean> {
    try {
      // 简化版本，实际项目中需要调用区块链
      return true; // 暂时返回 true，部署后再实现真实逻辑
    } catch {
      return false;
    }
  }

  /**
   * Generate paymaster and data field
   */
  private generatePaymasterAndData(userOp: UserOperation, gasCost: number): string {
    // 简化版本，返回 paymaster 地址
    return this.config.paymasterAddress + '0'.repeat(64); // 填充数据
  }

  /**
   * Create rejection error response
   */
  private createRejectionError(): PaymasterError {
    return {
      code: -32002,
      message: "request denied - insufficient Foodye balance or allowance",
      data: {
        acceptedTokens: [
          {
            name: "Foodye Coin",
            address: this.config.foodyeTokenAddress
          }
        ],
        paymasterAddress: this.config.paymasterAddress
      }
    };
  }
}

// Default configuration for Base network
export const FOODYE_PAYMASTER_CONFIG: PaymasterConfig = {
  paymasterAddress: process.env.NEXT_PUBLIC_FOODYE_PAYMASTER_ADDRESS || "",
  foodyeTokenAddress: process.env.NEXT_PUBLIC_FOODYE_TOKEN_ADDRESS || "",
  entryPointAddress: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789", // Standard EntryPoint
  exchangeRate: 25000000, // 1 ETH = 25M FOODYE (based on 1 FOODYE = 0.0001 USDC)
  rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || "https://mainnet.base.org",
  privateKey: process.env.PAYMASTER_PRIVATE_KEY || ""
};
