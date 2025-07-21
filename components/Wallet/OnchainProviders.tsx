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
      preference: 'smartWalletOnly', // Use only Smart Wallet
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
              theme: 'hacker',
            },
          }}
        >
          {children}
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
