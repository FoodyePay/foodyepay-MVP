// components/PaymasterSwap.tsx
// 简化的Swap组件

'use client';

import type { Token } from '@coinbase/onchainkit/token';
import { SwapDefault } from '@coinbase/onchainkit/swap';

interface PaymasterSwapProps {
  fromToken: Token;
  toToken: Token;
  title?: string;
}

export function PaymasterSwap({ fromToken, toToken, title }: PaymasterSwapProps) {
  return (
    <div className="w-full max-w-md space-y-4">
      {/* 标题 */}
      {title && (
        <h2 className="font-semibold text-lg mb-2">{title}</h2>
      )}

      {/* 标准Swap组件 */}
      <SwapDefault 
        from={[fromToken]} 
        to={[toToken]}
      />
    </div>
  );
}
