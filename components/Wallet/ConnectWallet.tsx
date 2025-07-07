'use client';

import { useFoodyeWallet } from './WalletProvider';

type Props = {
  onConnect?: (address: string) => void;
};

export default function ConnectWallet({ onConnect }: Props) {
  const { setWalletAddress } = useFoodyeWallet();

  const handleConnect = () => {
    const mockAddress = '0xF2675D28373A44fc90B5EFe38f0903aDc2a5191B';
    localStorage.setItem('foodye_wallet', mockAddress);
    setWalletAddress(mockAddress);
    console.log('✅ Wallet connected:', mockAddress);
    onConnect?.(mockAddress);
  };

  return (
    <button
      onClick={handleConnect}
      className="mt-4 px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
    >
      Connect Coinbase Wallet
    </button>
  );
}



