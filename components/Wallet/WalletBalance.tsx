'use client';

type Props = {
  address: string;
};

export default function WalletBalance({ address }: Props) {
  return (
    <div className="mt-4 text-sm text-green-400">
      ✅ Wallet connected: {address}
    </div>
  );
}

