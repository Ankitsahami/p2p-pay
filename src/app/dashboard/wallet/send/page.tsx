'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send, AlertTriangle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useWallet } from '@/hooks/use-wallet';
import { useAuth, usePrivy } from '@/hooks/use-auth';
import { useWallets } from '@privy-io/react-auth';
import { useSmartWallets } from '@privy-io/react-auth/smart-wallets';
import { WalletService } from '@/services/wallet-service';
import { TOKENS } from '@/lib/constants';
import { formatCrypto, formatCurrency } from '@/lib/utils';
import { createWalletClient, custom } from 'viem';
import { baseSepolia } from 'viem/chains';

export default function SendPage() {
  const router = useRouter();
  const { walletAddress } = useAuth();
  const { getBalance, deductBalance, activeCurrency, formatFiatValue } = useWallet();
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
    <div className="max-w-md mx-auto flex flex-col gap-6 select-none animate-fade-in">
      {/* Back Header Nav */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push('/dashboard/wallet')}
          className="p-2 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 active:scale-95 text-slate-400 hover:text-white transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h2 className="text-sm font-bold text-white">Send / Withdraw</h2>
      </div>

      {/* Main card form */}
      <Card className="p-6 md:p-8 flex flex-col gap-5 bg-white/[0.02]">
        <div className="flex flex-col gap-1 items-center text-center pb-3 border-b border-white/5">
          <div className="w-11 h-11 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-2">
            <Send className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white">Transfer Crypto Assets</h3>
          <p className="text-[10px] text-slate-400 mt-1 select-none">Send funds instantly over the Base network</p>
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
          <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold px-1 select-none">
            <span>Available Balance</span>
            <span>
              {formatCrypto(activeBalance, 4)} {tokenSymbol}
            </span>
          </div>

          {/* Dues conversion rates details */}
          {parseFloat(amount) > 0 && (
            <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-xs flex justify-between items-center animate-fade-in select-none">
              <span className="text-slate-400">Fiat Value Equivalent</span>
              <span className="font-bold text-white">{formatCurrency(equivalentFiat, activeCurrency)}</span>
            </div>
          )}

          {/* Network alert warning banner */}
          <div className="bg-amber-500/5 border border-amber-500/10 p-3 rounded-xl flex items-start gap-2.5 select-none">
            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <span className="text-[10px] text-slate-400 leading-normal">
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
