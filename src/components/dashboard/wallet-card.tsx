'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Copy, Check, ArrowDownLeft, ArrowUpRight, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/hooks/use-wallet';
import { useAuth } from '@/hooks/use-auth';
import { formatCurrency, formatCrypto, truncateAddress, copyToClipboard } from '@/lib/utils';

export const WalletCard = () => {
  const router = useRouter();
  const { walletAddress } = useAuth();
  const { totalFiatValue, activeCurrency, getBalance } = useWallet();
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    if (!walletAddress) return;
    const success = await copyToClipboard(walletAddress);
    if (success) {
      setCopied(true);
      toast.success('Address copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Card className="relative overflow-hidden bg-transparent bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 border-none shadow-2xl p-6 md:p-8 flex flex-col justify-between min-h-[220px] group select-none">
      {/* Background Graphic Orbs */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-500" />
      <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-black/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header Info */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-bold text-blue-200 uppercase tracking-widest flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-blue-300" />
            Smart Contract Account
          </span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs text-white/80 hover:text-white bg-white/10 hover:bg-white/15 px-3 py-1.5 rounded-lg border border-white/5 cursor-pointer transition-all active:scale-95"
          >
            <span>{truncateAddress(walletAddress, 8, 6)}</span>
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        <span className="px-3 py-1.5 text-[10px] font-bold text-white bg-white/15 backdrop-blur-md rounded-lg border border-white/10 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          BASE SEPOLIA
        </span>
      </div>

      {/* Balance Amount */}
      <div className="my-6">
        <span className="text-xs font-semibold text-blue-200 select-none">USDC Balance</span>
        <h2 className="text-3xl md:text-4xl font-extrabold text-white mt-1.5 tracking-tight">
          {formatCrypto(getBalance('USDC')?.balance || '0.00', 2)} USDC
        </h2>
        <p className="text-xs text-blue-200/80 mt-1 select-none">
          ≈ {formatCurrency(totalFiatValue, activeCurrency)}
        </p>
      </div>

      {/* Quick Action Buttons */}
      <div className="flex items-center gap-3 mt-2">
        <Button
          variant="secondary"
          size="sm"
          className="flex-1 bg-white/10 border-white/5 text-white hover:bg-white/15 active:scale-95"
          icon={<ArrowDownLeft className="w-4 h-4 text-emerald-400" />}
          onClick={() => router.push('/dashboard/wallet/deposit')}
        >
          Deposit
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="flex-1 bg-white/10 border-white/5 text-white hover:bg-white/15 active:scale-95"
          icon={<ArrowUpRight className="w-4 h-4 text-amber-400" />}
          onClick={() => router.push('/dashboard/wallet/send')}
        >
          Send
        </Button>
      </div>
    </Card>
  );
};
