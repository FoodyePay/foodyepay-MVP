import { OnchainKitProvider } from '@coinbase/onchainkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { base } from 'viem/chains';
import { WagmiProvider } from 'wagmi';
import { createConfig, http } from 'wagmi';
import { coinbaseWallet } from 'wagmi/connectors';

// Create wagmi config
const config = createConfig({
  chains: [base],
  connectors: [
    coinbaseWallet({
      appName: 'FoodyePay',
      preference: 'smartWalletOnly', // 强制使用智能钱包
      version: '4', // 确保使用最新版本
    }),
  ],
  transports: {
    [base.id]: http(),
  },
});

const queryClient = new QueryClient();

interface OnchainProvidersProps {
  children: React.ReactNode;
}

export function OnchainProviders({ children }: OnchainProvidersProps) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <OnchainKitProvider
          apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
          chain={base}
          projectId={process.env.NEXT_PUBLIC_COINBASE_PROJECT_ID}
          config={{
            appearance: {
              mode: 'dark',
              theme: 'dark',
            },
            // 启用 Paymaster 来支持 gasless transactions
            paymaster: process.env.NEXT_PUBLIC_COINBASE_PAYMASTER_URL || `https://api.developer.coinbase.com/rpc/v1/base/${process.env.NEXT_PUBLIC_COINBASE_PROJECT_ID}`,
          }}
        >
          {children}
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
