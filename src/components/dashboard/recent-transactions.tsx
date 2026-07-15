'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowUpRight, ArrowDownLeft, Receipt, Send, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/hooks/use-wallet';
import { useAuth } from '@/hooks/use-auth';
import { WalletService } from '@/services/wallet-service';
import { useThemeStore } from '@/stores/theme-store';
import { formatCurrency, getRelativeTime, formatCrypto, truncateAddress, getExplorerUrl } from '@/lib/utils';
import { type Transaction } from '@/types';
import { cn } from '@/lib/utils';

export const RecentTransactions = () => {
  const { activeCurrency } = useWallet();
  const { walletAddress } = useAuth();
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [selectedTx, setSelectedTx] = React.useState<Transaction | null>(null);

  React.useEffect(() => {
    if (!walletAddress) {
      setTransactions([]);
      return;
    }
    const fetchTxs = async () => {
      try {
        const res = await WalletService.getTransactionHistory(walletAddress, 1, 5);
        setTransactions(res.items);
      } catch (err) {
        console.error('Error loading recent transactions:', err);
      }
    };
    fetchTxs();
  }, [walletAddress]);

  const getIcon = (type: string) => {
    const styles = 'w-5 h-5 flex-shrink-0';
    if (type === 'bill_payment') return <Receipt className={`${styles} text-blue-400`} />;
    if (type === 'deposit') return <ArrowDownLeft className={`${styles} text-emerald-400`} />;
    if (type === 'withdrawal') return <ArrowUpRight className={`${styles} text-amber-400`} />;
    if (type === 'send') return <Send className={`${styles} text-violet-400`} />;
    return <ArrowDownLeft className={`${styles} text-slate-400`} />;
  };

  const getStatusVariant = (status: string) => {
    if (status === 'completed') return 'success';
    if (status === 'pending') return 'warning';
    if (status === 'failed') return 'error';
    return 'neutral';
  };

  return (
    <Card className="p-0 select-none overflow-hidden" padding="none">
      <div className={cn("flex items-center justify-between px-5 py-4 border-b", isDark ? "border-white/5" : "border-slate-100")}>
        <div>
          <h3 className={cn("text-sm font-bold", isDark ? "text-white" : "text-slate-800")}>Recent Transactions</h3>
          <p className={cn("text-[10px]", isDark ? "text-white/50 mt-0.5" : "text-slate-500 mt-0.5")}>Your latest billing and transfer activities</p>
        </div>
        <Link
          href="/dashboard/history"
          className="text-xs font-semibold text-blue-500 hover:text-blue-600 flex items-center gap-0.5 group"
        >
          <span>View All</span>
          <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      <div className={cn("divide-y", isDark ? "divide-white/5" : "divide-slate-100")}>
        {transactions.length === 0 ? (
          <div className={cn("px-5 py-8 text-center text-xs", isDark ? "text-white/40" : "text-slate-500")}>
            No transactions found
          </div>
        ) : (
          transactions.map((tx) => (
            <button
              key={tx.id}
              onClick={() => setSelectedTx(tx)}
              className={cn(
                "w-full px-5 py-4 flex items-center justify-between transition-colors text-left cursor-pointer",
                isDark ? "hover:bg-white/5" : "hover:bg-slate-50/50"
              )}
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-xl border flex items-center justify-center",
                  isDark ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-100"
                )}>
                  {getIcon(tx.type)}
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className={cn("text-xs font-bold max-w-[150px] sm:max-w-[240px] truncate", isDark ? "text-white" : "text-slate-800")}>
                    {tx.merchant || tx.description}
                  </span>
                  <span className={cn("text-[10px] font-semibold", isDark ? "text-white/40" : "text-slate-500")}>{getRelativeTime(tx.timestamp)}</span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1.5">
                <span className={cn("text-xs font-bold", isDark ? "text-white" : "text-slate-900")}>
                  {tx.type === 'deposit' ? '+' : '-'}
                  {formatCurrency(tx.fiatAmount, activeCurrency)}
                </span>
                <Badge variant={getStatusVariant(tx.status)} size="sm">
                  {tx.status}
                </Badge>
              </div>
            </button>
          ))
        )}
      </div>

      {/* Transaction Receipt Modal */}
      <Modal
        isOpen={!!selectedTx}
        onClose={() => setSelectedTx(null)}
        title="Transaction Details"
        size="md"
      >
        {selectedTx && (
          <div className={cn("flex flex-col gap-6 select-none", isDark ? "text-white/90" : "text-slate-850")}>
            {/* Header Status */}
            <div className={cn("flex flex-col items-center text-center pb-4 border-b", isDark ? "border-white/5" : "border-slate-100")}>
              <div className={cn(
                "w-12 h-12 rounded-2xl border flex items-center justify-center mb-3",
                isDark ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-100"
              )}>
                {getIcon(selectedTx.type)}
              </div>
              <h4 className={cn("text-lg font-extrabold", isDark ? "text-white" : "text-slate-900")}>
                {selectedTx.type === 'deposit' ? '+' : '-'}
                {formatCurrency(selectedTx.fiatAmount, activeCurrency)}
              </h4>
              <p className={cn("text-xs mt-1", isDark ? "text-white/50" : "text-slate-500")}>{selectedTx.description}</p>
              <Badge variant={getStatusVariant(selectedTx.status)} size="md" className="mt-3 capitalize">
                {selectedTx.status}
              </Badge>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-xs">
              <div className="flex flex-col gap-1">
                <span className={cn("font-semibold uppercase text-[9px] tracking-wider", isDark ? "text-white/40" : "text-slate-500")}>Transaction ID</span>
                <span className={cn("font-bold", isDark ? "text-white" : "text-slate-800")}>{selectedTx.id}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className={cn("font-semibold uppercase text-[9px] tracking-wider", isDark ? "text-white/40" : "text-slate-500")}>Asset Dues</span>
                <span className={cn("font-bold", isDark ? "text-white" : "text-slate-800")}>
                  {formatCrypto(selectedTx.cryptoAmount, 4)} {selectedTx.token}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className={cn("font-semibold uppercase text-[9px] tracking-wider", isDark ? "text-white/40" : "text-slate-500")}>Network</span>
                <span className={cn("font-bold", isDark ? "text-white" : "text-slate-800")}>{selectedTx.network}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className={cn("font-semibold uppercase text-[9px] tracking-wider", isDark ? "text-white/40" : "text-slate-500")}>Timestamp</span>
                <span className={cn("font-bold", isDark ? "text-white" : "text-slate-800")}>
                  {new Date(selectedTx.timestamp).toLocaleString()}
                </span>
              </div>
              {selectedTx.txHash && (
                <div className="col-span-2 flex flex-col gap-1">
                  <span className={cn("font-semibold uppercase text-[9px] tracking-wider", isDark ? "text-white/40" : "text-slate-500")}>Blockchain Hash</span>
                  <a
                    href={getExplorerUrl(selectedTx.txHash)}
                    target="_blank"
                    rel="noreferrer"
                    className={cn("font-mono text-[10px] break-all", isDark ? "text-blue-400 hover:underline" : "text-blue-600 hover:underline")}
                  >
                    {selectedTx.txHash}
                  </a>
                </div>
              )}
            </div>

            {/* Close Button */}
            <Button variant="secondary" className="w-full mt-2" onClick={() => setSelectedTx(null)}>
              Dismiss Details
            </Button>
          </div>
        )}
      </Modal>
    </Card>
  );
};
