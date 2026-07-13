'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowLeft, Copy, Check, Info, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { copyToClipboard, truncateAddress } from '@/lib/utils';

export default function DepositPage() {
  const router = useRouter();
  const { walletAddress } = useAuth();
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

  return (
    <div className="max-w-md mx-auto flex flex-col gap-6 select-none animate-fade-in">
      {/* Back button */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push('/dashboard/wallet')}
          className="p-2 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 active:scale-95 text-slate-400 hover:text-white transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h2 className="text-sm font-bold text-white">Deposit Crypto</h2>
      </div>

      {/* Main Details Card */}
      <Card className="p-6 md:p-8 flex flex-col items-center gap-6 bg-white/[0.02] text-center">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
          <ShieldCheck className="w-5 h-5" />
        </div>

        <div>
          <h3 className="text-sm font-bold text-white">Your Deposit Address</h3>
          <p className="text-[10px] text-slate-400 mt-1">Send only Base network supported tokens</p>
        </div>

        {/* QR Code */}
        <div className="p-4 bg-white rounded-2xl shadow-xl shadow-black/30">
          {walletAddress ? (
            <QRCodeSVG value={walletAddress} size={150} />
          ) : (
            <div className="w-36 h-36 bg-slate-800 animate-pulse rounded-lg" />
          )}
        </div>

        {/* Address click action */}
        <button
          onClick={handleCopy}
          className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-xs hover:bg-white/10 cursor-pointer active:scale-98 transition-all group"
        >
          <span className="font-mono text-slate-300 truncate max-w-[240px]">
            {walletAddress}
          </span>
          {copied ? (
            <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          ) : (
            <Copy className="w-4 h-4 text-slate-400 group-hover:text-white flex-shrink-0" />
          )}
        </button>

        {/* Instructions */}
        <div className="w-full bg-blue-500/5 border border-blue-500/10 p-4 rounded-xl text-left flex items-start gap-3">
          <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1 text-[10px] text-slate-400 leading-relaxed select-none">
            <span className="font-bold text-blue-300">Important Instructions</span>
            <p>• Only send USDC, USDT, WETH or DAI to this wallet.</p>
            <p>• Make sure the network is strictly set to <strong className="text-blue-200">Base</strong>.</p>
            <p>• Deposits sent to other networks (e.g. Ethereum Mainnet) may be lost permanently.</p>
          </div>
        </div>

        <Button variant="secondary" className="w-full" onClick={() => router.push('/dashboard/wallet')}>
          Back to Wallet
        </Button>
      </Card>
    </div>
  );
}
