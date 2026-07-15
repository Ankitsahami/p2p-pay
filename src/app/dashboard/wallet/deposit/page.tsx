'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowLeft, Copy, Check, Info, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useThemeStore } from '@/stores/theme-store';
import { copyToClipboard } from '@/lib/utils';
import { cn } from '@/lib/utils';

export default function DepositPage() {
  const router = useRouter();
  const { walletAddress } = useAuth();
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';
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
    <div className={cn("max-w-md mx-auto flex flex-col gap-6 select-none animate-fade-in transition-colors duration-300", isDark ? "text-white" : "text-slate-800")}>
      {/* Back button */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push('/dashboard/wallet')}
          className={cn(
            "p-2 rounded-xl border flex items-center justify-center active:scale-95 transition-all cursor-pointer",
            isDark
              ? "border-white/10 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white"
              : "border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-700"
          )}
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h2 className={cn("text-sm font-bold", isDark ? "text-white" : "text-slate-800")}>Deposit Crypto</h2>
      </div>

      {/* Main Details Card */}
      <Card className="p-6 md:p-8 flex flex-col items-center gap-6 text-center">
        <div className={cn(
          "w-12 h-12 rounded-2xl flex items-center justify-center border",
          isDark ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-emerald-50 border-emerald-100 text-emerald-600"
        )}>
          <ShieldCheck className="w-5 h-5" />
        </div>

        <div>
          <h3 className={cn("text-sm font-bold", isDark ? "text-white" : "text-slate-800")}>Your Deposit Address</h3>
          <p className={cn("text-[10px] mt-1", isDark ? "text-white/40" : "text-slate-400")}>Send only Base network supported tokens</p>
        </div>

        {/* QR Code */}
        <div className="p-4 bg-white border border-slate-100 dark:border-white/5 rounded-2xl shadow-xl shadow-black/10 dark:shadow-none">
          {walletAddress ? (
            <QRCodeSVG value={walletAddress} size={150} />
          ) : (
            <div className="w-36 h-36 bg-slate-800 dark:bg-white/5 animate-pulse rounded-lg" />
          )}
        </div>

        {/* Address click action */}
        <button
          onClick={handleCopy}
          className={cn(
            "w-full flex items-center justify-between gap-3 px-4 py-3 border rounded-xl text-xs cursor-pointer active:scale-98 transition-all group",
            isDark
              ? "bg-white/5 border-white/10 hover:bg-white/10"
              : "bg-slate-50 border-slate-200 hover:bg-slate-100"
          )}
        >
          <span className={cn("font-mono truncate max-w-[240px]", isDark ? "text-slate-300" : "text-slate-700")}>
            {walletAddress}
          </span>
          {copied ? (
            <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          ) : (
            <Copy className={cn("w-4 h-4 flex-shrink-0 transition-colors", isDark ? "text-white/40 group-hover:text-white" : "text-slate-400 group-hover:text-slate-700")} />
          )}
        </button>

        {/* Instructions */}
        <div className={cn(
          "w-full p-4 rounded-xl border text-left flex items-start gap-3 transition-colors",
          isDark
            ? "bg-blue-500/5 border-blue-500/10 text-white"
            : "bg-blue-50 border-blue-100 text-slate-800"
        )}>
          <Info className="w-4 h-4 text-blue-500 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className={cn("flex flex-col gap-1 text-[10px] leading-relaxed select-none", isDark ? "text-white/50" : "text-slate-500")}>
            <span className="font-bold text-blue-600 dark:text-blue-400">Important Instructions</span>
            <p>• Only send USDC, USDT, WETH or DAI to this wallet.</p>
            <p>• Make sure the network is strictly set to <strong className="text-blue-600 dark:text-blue-400">Base</strong>.</p>
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
