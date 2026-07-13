'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, ArrowDownLeft, ArrowUpRight, Shield, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/hooks/use-wallet';
import { useAuth } from '@/hooks/use-auth';
import { formatCurrency, formatCrypto, truncateAddress, copyToClipboard, getExplorerUrl } from '@/lib/utils';
import { TOKENS } from '@/lib/constants';

export default function WalletPage() {
  const router = useRouter();
  const { walletAddress } = useAuth();
  const { balances, totalFiatValue, activeCurrency } = useWallet();
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    if (!walletAddress) return;
    const success = await copyToClipboard(walletAddress);
    if (success) {
      setCopied(true);
      toast.success('Address copied');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Color mapping corresponding to token symbols
  const colors: Record<string, string> = {
    USDC: '#3B82F6',
    WETH: '#8B5CF6',
    USDT: '#10B981',
    DAI: '#F59E0B',
  };

  return (
    <div className="flex flex-col gap-6 md:gap-8 select-none">
      {/* Upper Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {/* Balance Card */}
        <Card className="md:col-span-2 p-6 flex flex-col justify-between bg-gradient-to-br from-[#0d0d0d] to-[#181818] relative overflow-hidden">
          <div className="flex flex-col gap-1.5 z-10">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Estimated Balance</span>
            <h2 className="text-3xl font-extrabold text-white">
              {formatCurrency(totalFiatValue, activeCurrency)}
            </h2>
          </div>

          <div className="flex flex-col gap-3 z-10 mt-8">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Smart Wallet Address</span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-blue-400 hover:text-blue-300 font-semibold cursor-pointer"
              >
                <span>{truncateAddress(walletAddress, 10, 8)}</span>
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-400">
              <span>Primary Network</span>
              <span className="font-semibold text-white flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                Base Chain
              </span>
            </div>
          </div>
        </Card>

        {/* Receive QR Card */}
        <Card className="p-5 flex flex-col items-center justify-center gap-4 bg-white/[0.02]">
          <div className="p-3 bg-white rounded-2xl">
            {walletAddress ? (
              <QRCodeSVG value={walletAddress} size={110} />
            ) : (
              <div className="w-28 h-28 bg-slate-800 animate-pulse rounded-lg" />
            )}
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center select-none leading-relaxed">
            Scan to Deposit USDC
          </span>
        </Card>
      </div>

      {/* Action triggers */}
      <div className="flex items-center gap-4">
        <Button
          variant="primary"
          className="flex-1 font-semibold"
          icon={<ArrowDownLeft className="w-4 h-4" />}
          onClick={() => router.push('/dashboard/wallet/deposit')}
        >
          Deposit Crypto
        </Button>
        <Button
          variant="secondary"
          className="flex-1 font-semibold"
          icon={<ArrowUpRight className="w-4 h-4" />}
          onClick={() => router.push('/dashboard/wallet/send')}
        >
          Send / Withdraw
        </Button>
      </div>

      {/* Assets List */}
      <div className="flex flex-col gap-4">
        <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
          Supported Assets
        </span>

        <div className="flex flex-col gap-3">
          {balances.map((bal) => {
            const tokenColor = colors[bal.token.symbol] || '#64748B';
            return (
              <Card
                key={bal.token.symbol}
                className="p-5 flex items-center justify-between hover:bg-white/[0.04] transition-all bg-white/[0.02]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center font-bold text-xs" style={{ color: tokenColor }}>
                    {bal.token.symbol.slice(0, 2)}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold text-white">{bal.token.name}</span>
                    <span className="text-[10px] text-slate-500 font-semibold">{bal.token.symbol} on Base</span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-0.5">
                  <span className="text-xs font-bold text-white">
                    {formatCrypto(bal.balance, 4)} {bal.token.symbol}
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold">
                    {formatCurrency(bal.fiatValue, activeCurrency)}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
