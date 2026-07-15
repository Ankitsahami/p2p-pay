'use client';

import * as React from 'react';
import { Search, Receipt, ArrowDownLeft, ArrowUpRight, Send, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs } from '@/components/ui/tabs';
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

export default function HistoryPage() {
  const { activeCurrency } = useWallet();
  const { walletAddress } = useAuth();
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [search, setSearch] = React.useState('');
  const [activeTab, setActiveTab] = React.useState('all');
  const [selectedTx, setSelectedTx] = React.useState<Transaction | null>(null);

  React.useEffect(() => {
    if (!walletAddress) {
      setTransactions([]);
      return;
    }
    const fetchTxs = async () => {
      try {
        const res = await WalletService.getTransactionHistory(walletAddress, 1, 100);
        setTransactions(res.items);
      } catch (err) {
        console.error('Error fetching transactions history:', err);
      }
    };
    fetchTxs();
  }, [walletAddress]);

  const tabs = [
    { id: 'all', label: 'All Operations' },
    { id: 'bill_payment', label: 'Bill Payments' },
    { id: 'deposit', label: 'Deposits' },
    { id: 'send', label: 'Sends' },
  ];

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

  const filteredTransactions = React.useMemo(() => {
    return transactions.filter((tx) => {
      // Tab category filter match
      const tabMatch = activeTab === 'all' || tx.type === activeTab;
      
      // 3. Search match
      const searchLower = search.toLowerCase();
      const searchMatch =
        !search.trim() ||
        tx.description.toLowerCase().includes(searchLower) ||
        (tx.merchant && tx.merchant.toLowerCase().includes(searchLower)) ||
        tx.id.toLowerCase().includes(searchLower);

      return tabMatch && searchMatch;
    });
  }, [transactions, activeTab, search]);

  return (
    <div className={cn("flex flex-col gap-6 md:gap-8 select-none transition-colors duration-300", isDark ? "text-white" : "text-slate-800")}>
      {/* Search and Filters row */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="max-w-md w-full">
          <Input
            placeholder="Search by ID, merchant or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="w-4 h-4 text-slate-400 dark:text-white/40" />}
          />
        </div>
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      </div>

      {/* Main Ledger List */}
      <Card className="p-0 overflow-hidden" padding="none">
        <div className={cn("divide-y", isDark ? "divide-white/5" : "divide-slate-100")}>
          {filteredTransactions.length === 0 ? (
            <div className={cn("px-5 py-12 text-center text-xs flex flex-col items-center justify-center gap-3", isDark ? "text-white/40" : "text-slate-505")}>
               <Clock className={cn("w-8 h-8", isDark ? "text-white/20" : "text-slate-400")} />
              <span>No transactions matching criteria.</span>
            </div>
          ) : (
            filteredTransactions.map((tx) => (
              <button
                key={tx.id}
                onClick={() => setSelectedTx(tx)}
                className={cn(
                  "w-full px-5 py-4 flex items-center justify-between transition-colors text-left cursor-pointer",
                  isDark ? "hover:bg-white/5" : "hover:bg-slate-50"
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
                    <span className={cn("text-xs font-bold max-w-[150px] sm:max-w-[280px] truncate", isDark ? "text-white" : "text-slate-800")}>
                      {tx.merchant || tx.description}
                    </span>
                    <span className={cn("text-[10px] font-semibold", isDark ? "text-white/40" : "text-slate-500")}>{getRelativeTime(tx.timestamp)}</span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5">
                  <span className={cn("text-xs font-bold", isDark ? "text-white" : "text-slate-800")}>
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
      </Card>

      {/* Transaction Details Modal */}
      <Modal
        isOpen={!!selectedTx}
        onClose={() => setSelectedTx(null)}
        title="Transaction Ledger Details"
        size="md"
      >
        {selectedTx && (() => {
          const formattedCompletedAt = (() => {
            const date = new Date(selectedTx.timestamp);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            let hours = date.getHours();
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12;
            return `${day}/${month}/${year}, ${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
          })();

          return (
            <div className={cn("flex flex-col gap-6 select-none animate-fade-in", isDark ? "text-white/90" : "text-slate-800")}>
            <div className={cn("flex flex-col items-center text-center pb-4 border-b", isDark ? "border-white/5" : "border-slate-100")}>
              <div className={cn(
                "w-12 h-12 rounded-2xl border flex items-center justify-center mb-3",
                isDark ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-100"
              )}>
                {getIcon(selectedTx.type)}
              </div>
              <h4 className={cn("text-lg font-extrabold", isDark ? "text-white" : "text-slate-800")}>
                {selectedTx.type === 'deposit' ? '+' : '-'}
                {formatCurrency(selectedTx.fiatAmount, activeCurrency)}
              </h4>
              <p className={cn("text-xs mt-1", isDark ? "text-white/50" : "text-slate-500")}>{selectedTx.description}</p>
              <Badge variant={getStatusVariant(selectedTx.status)} size="md" className="mt-3 capitalize">
                {selectedTx.status}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-xs">
              <div className="flex flex-col gap-1">
                <span className={cn("font-semibold uppercase text-[9px] tracking-wider", isDark ? "text-white/40" : "text-slate-500")}>Order ID</span>
                <span className={cn("font-bold", isDark ? "text-white" : "text-slate-800")}>{selectedTx.id}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className={cn("font-semibold uppercase text-[9px] tracking-wider", isDark ? "text-white/40" : "text-slate-500")}>Type</span>
                <span className={cn("font-bold uppercase", isDark ? "text-white" : "text-slate-800")}>{selectedTx.type === 'bill_payment' ? 'Sell' : selectedTx.type}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className={cn("font-semibold uppercase text-[9px] tracking-wider", isDark ? "text-white/40" : "text-slate-500")}>Amount</span>
                <span className={cn("font-bold", isDark ? "text-white" : "text-slate-800")}>
                  {formatCrypto(selectedTx.cryptoAmount, 4)} {selectedTx.token}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className={cn("font-semibold uppercase text-[9px] tracking-wider", isDark ? "text-white/40" : "text-slate-500")}>Fee</span>
                <span className={cn("font-bold", isDark ? "text-white" : "text-slate-800")}>
                  {selectedTx.type === 'bill_payment' ? '0.050000 USDC' : '0.00 USDC'}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className={cn("font-semibold uppercase text-[9px] tracking-wider", isDark ? "text-white/40" : "text-slate-500")}>Utility Provider Received</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(selectedTx.fiatAmount, activeCurrency)}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className={cn("font-semibold uppercase text-[9px] tracking-wider", isDark ? "text-white/40" : "text-slate-500")}>Paid By</span>
                <span className={cn("font-mono font-bold", isDark ? "text-white/80" : "text-slate-800")}>
                  {selectedTx.walletAddress ? `${selectedTx.walletAddress.slice(0, 6)}...${selectedTx.walletAddress.slice(-4)}` : 'Smart Account'}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className={cn("font-semibold uppercase text-[9px] tracking-wider", isDark ? "text-white/40" : "text-slate-500")}>Paid To (Merchant)</span>
                <span className={cn("font-bold", isDark ? "text-white" : "text-slate-800")}>
                  {selectedTx.type === 'bill_payment' ? 'Goofy Faucet Merchant' : 'N/A'}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className={cn("font-semibold uppercase text-[9px] tracking-wider", isDark ? "text-white/40" : "text-slate-500")}>Completed In</span>
                <span className={cn("font-bold", isDark ? "text-white" : "text-slate-800")}>
                  {selectedTx.type === 'bill_payment' ? '12s' : 'N/A'}
                </span>
              </div>
              <div className="flex flex-col gap-1 col-span-2">
                <span className={cn("font-semibold uppercase text-[9px] tracking-wider", isDark ? "text-white/40" : "text-slate-500")}>Completed At</span>
                <span className={cn("font-bold", isDark ? "text-white" : "text-slate-800")}>{formattedCompletedAt}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className={cn("font-semibold uppercase text-[9px] tracking-wider", isDark ? "text-white/40" : "text-slate-500")}>Network</span>
                <span className={cn("font-bold", isDark ? "text-white" : "text-slate-800")}>{selectedTx.network}</span>
              </div>
              {selectedTx.txHash && (
                <div className="col-span-2 flex flex-col gap-1 pt-1">
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

            <Button variant="secondary" className="w-full mt-2" onClick={() => setSelectedTx(null)}>
              Dismiss Details
            </Button>
          </div>
          );
        })()}
      </Modal>
    </div>
  );
}
