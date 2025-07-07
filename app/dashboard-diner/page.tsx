'use client';

import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownLink,
  WalletDropdownDisconnect,
} from '@coinbase/onchainkit/wallet';

import {
  Address,
  Avatar,
  Name,
  Identity,
  EthBalance,
} from '@coinbase/onchainkit/identity';

import { Buy } from '@coinbase/onchainkit/buy';
import { SwapDefault } from '@coinbase/onchainkit/swap';
import type { Token } from '@coinbase/onchainkit/token';

export default function DinerDashboard() {
  const chainId = 8453;

  const ethToken: Token = {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
    address: '', // Native ETH
    chainId,
    image:
      'https://dynamic-assets.coinbase.com/dbb4b4983bde81309ddab83eb598358eb44375b930b94687ebe38bc22e52c3b2125258ffb8477a5ef22e33d6bd72e32a506c391caa13af64c00e46613c3e5806/asset_icons/4113b082d21cc5fab17fc8f2d19fb996165bcce635e6900f7fc2d57c4ef33ae9.png',
  };

  const usdcToken: Token = {
    name: 'USDC',
    address: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
    symbol: 'USDC',
    decimals: 6,
    chainId,
    image:
      'https://dynamic-assets.coinbase.com/3c15df5e2ac7d4abbe9499ed9335041f00c620f28e8de2f93474a9f432058742cdf4674bd43f309e69778a26969372310135be97eb183d91c492154176d455b8/asset_icons/9d67b728b6c8f457717154b3a35f9ddc702eae7e76c4684ee39302c4d7fd0bb8.png',
  };

  const foodyToken: Token = {
    name: 'Foodye Coin',
    symbol: 'FOODY',
    decimals: 18,
    address: '0x1022b1b028a2237c440dbac51dc6fc220d88c08f',
    chainId,
    image: '/foody.png',
  };

  return (
    <div className="flex flex-col min-h-screen font-sans dark:bg-black dark:text-white bg-white text-black">
      {/* ✅ Wallet Header */}
      <header className="p-4 flex justify-end">
        <Wallet>
          <ConnectWallet>
            <Avatar className="h-6 w-6" />
            <Name />
          </ConnectWallet>
          <WalletDropdown>
            <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
              <Avatar />
              <Name />
              <Address />
              <EthBalance />
            </Identity>
            <WalletDropdownLink
              icon="wallet"
              href="https://keys.coinbase.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Wallet
            </WalletDropdownLink>
            <WalletDropdownDisconnect />
          </WalletDropdown>
        </Wallet>
      </header>

      {/* ✅ Main UI */}
      <main className="flex-grow flex flex-col items-center justify-start p-6 space-y-10">
        {/* ✅ Buy ETH */}
        <div className="flex items-center space-x-2">
          <span className="text-xl font-semibold">Buy</span>
          <Buy toToken={ethToken} />
        </div>

        {/* ✅ Swap ETH → USDC */}
        <div className="w-full max-w-md">
          <h2 className="font-semibold text-lg mb-2">Swap ETH to USDC</h2>
          <SwapDefault from={[ethToken]} to={[usdcToken]} />
        </div>

        {/* ✅ Swap USDC → FOODY */}
        <div className="w-full max-w-md">
          <h2 className="font-semibold text-lg mb-2">Swap USDC to FOODY</h2>
          <SwapDefault from={[usdcToken]} to={[foodyToken]} />
        </div>
      </main>
    </div>
  );
}
