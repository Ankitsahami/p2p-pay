'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useWallet } from '@/hooks/use-wallet';
import { useAuth } from '@/hooks/use-auth';
import { useThemeStore } from '@/stores/theme-store';
import { useWallets } from '@privy-io/react-auth';
import { useSmartWallets } from '@privy-io/react-auth/smart-wallets';
import { WalletService } from '@/services/wallet-service';
import { TOKENS } from '@/lib/constants';
import { formatCrypto, formatCurrency } from '@/lib/utils';
import { createWalletClient, custom } from 'viem';
import { baseSepolia } from 'viem/chains';
import { cn } from '@/lib/utils';

export default function SendPage() {
  const router = useRouter();
  const { walletAddress } = useAuth();
  const { getBalance, deductBalance, activeCurrency, formatFiatValue } = useWallet();
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';
  const { wallets } = useWallets();
  const { client: smartWalletClient } = useSmartWallets();

  // Form State
  const [recipient, setRecipient] = React.useState('');
  const [tokenSymbol, setTokenSymbol] = React.useState('USDC');
  const [amount, setAmount] = React.useState('');
  const [isSending, setIsSending] = React.useState(false);

  const selectedToken = React.useMemo(() => {
    return TOKENS.find((t) => t.symbol === tokenSymbol) || TOKENS[0];
  }, [tokenSymbol]);

  const activeBalance = React.useMemo(() => {
    const balObj = getBalance(tokenSymbol);
    return balObj ? parseFloat(balObj.balance) : 0;
  }, [tokenSymbol, getBalance]);

  const tokenOptions = React.useMemo(() => {
    return TOKENS.map((t) => ({
      value: t.symbol,
      label: t.symbol,
    }));
  }, []);

  const handleMax = () => {
    // Keep 0.005 ETH for gas if sending WETH, otherwise send full balance
    if (tokenSymbol === 'WETH') {
      setAmount(Math.max(0, activeBalance - 0.005).toFixed(6));
    } else {
      setAmount(activeBalance.toFixed(6));
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient || !amount) {
      toast.error('Please enter address and amount');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (numAmount > activeBalance) {
      toast.error(`Insufficient ${tokenSymbol} balance`);
      return;
    }

    setIsSending(true);

    try {
      let walletClient = undefined;
      if (smartWalletClient) {
        walletClient = smartWalletClient;
      } else {
        const activeWallet = wallets.find(
          (w) => w.walletClientType === 'privy' || w.connectorType === 'embedded'
        );
        if (activeWallet) {
          const provider = await activeWallet.getEthereumProvider();
          walletClient = createWalletClient({
            account: activeWallet.address as `0x${string}`,
            chain: baseSepolia,
            transport: custom(provider),
          });
        }
      }

      await WalletService.sendTransaction(recipient, amount, selectedToken, walletAddress, walletClient);
      
      // Deduct balance locally
      deductBalance(tokenSymbol, amount);
      
      toast.success(`${amount} ${tokenSymbol} sent successfully!`);
      router.push('/dashboard/wallet');
    } catch (err: any) {
      toast.error(err.message || 'Transaction execution failed');
    } finally {
      setIsSending(false);
    }
  };

  // Live conversion calculations for input display
  const equivalentFiat = React.useMemo(() => {
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) return 0;
    const priceUsd = WalletService.getTokenPrice(tokenSymbol, 'USD');
    return formatFiatValue(num * priceUsd);
  }, [amount, tokenSymbol, formatFiatValue]);

  return (
    <div className={cn("max-w-md mx-auto flex flex-col gap-6 select-none animate-fade-in transition-colors duration-300", isDark ? "text-white" : "text-slate-800")}>
      {/* Back Header Nav */}
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
        <h2 className={cn("text-sm font-bold", isDark ? "text-white" : "text-slate-800")}>Send / Withdraw</h2>
      </div>

      {/* Main card form */}
      <Card className="p-6 md:p-8 flex flex-col gap-5">
        <div className={cn("flex flex-col gap-1 items-center text-center pb-3 border-b", isDark ? "border-white/5" : "border-slate-100")}>
          <div className="w-11 h-11 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-2">
            <Send className="w-5 h-5" />
          </div>
          <h3 className={cn("text-sm font-bold", isDark ? "text-white" : "text-slate-800")}>Transfer Crypto Assets</h3>
          <p className={cn("text-[10px] mt-1 select-none", isDark ? "text-white/40" : "text-slate-400")}>Send funds instantly over the Base network</p>
        </div>

        <form onSubmit={handleSend} className="flex flex-col gap-4">
          <Input
            label="Recipient Address (ENS or 0x)"
            placeholder="Enter Ethereum address"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
          />

          <div className="grid grid-cols-3 gap-3 items-end">
            <div className="col-span-1">
              <Select
                label="Asset"
                options={tokenOptions}
                value={tokenSymbol}
                onChange={setTokenSymbol}
              />
            </div>
            <div className="col-span-2 relative">
              <Input
                label="Amount"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pr-12"
              />
              <button
                type="button"
                onClick={handleMax}
                className="absolute right-3.5 top-[33px] text-[10px] font-bold text-blue-400 hover:text-blue-300 cursor-pointer active:scale-95"
              >
                MAX
              </button>
            </div>
          </div>

          {/* Current balance indicator */}
          <div className={cn("flex items-center justify-between text-[10px] font-semibold px-1 select-none", isDark ? "text-white/40" : "text-slate-500")}>
            <span>Available Balance</span>
            <span>
              {formatCrypto(activeBalance, 4)} {tokenSymbol}
            </span>
          </div>

          {/* Dues conversion rates details */}
          {parseFloat(amount) > 0 && (
            <div className={cn(
              "p-3 border rounded-xl text-xs flex justify-between items-center animate-fade-in select-none",
              isDark ? "bg-white/5 border-white/5" : "bg-slate-50 border-slate-100"
            )}>
              <span className={cn(isDark ? "text-white/40" : "text-slate-400")}>Fiat Value Equivalent</span>
              <span className={cn("font-bold", isDark ? "text-white" : "text-slate-800")}>{formatCurrency(equivalentFiat, activeCurrency)}</span>
            </div>
          )}

          {/* Network alert warning banner */}
          <div className={cn(
            "p-3 rounded-xl flex items-start gap-2.5 select-none border",
            isDark
              ? "bg-amber-500/5 border-amber-500/10 text-white"
              : "bg-amber-50 border border-amber-100 text-slate-800"
          )}>
            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <span className={cn("text-[10px] leading-normal", isDark ? "text-white/40" : "text-slate-400")}>
              Please double check the destination address. Transactions sent to incorrect addresses or networks cannot be reversed.
            </span>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full mt-2 font-bold"
            loading={isSending}
            disabled={!recipient || !amount}
          >
            Confirm Transfer
          </Button>
        </form>
      </Card>
    </div>
  );
}
