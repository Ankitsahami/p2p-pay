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
import { formatCurrency, getRelativeTime, formatCrypto, truncateAddress, getExplorerUrl } from '@/lib/utils';
import { type Transaction } from '@/types';

export default function HistoryPage() {
  const { activeCurrency } = useWallet();
  const { walletAddress } = useAuth();
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
    <div className="flex flex-col gap-6 md:gap-8 select-none text-slate-800">
      {/* Search and Filters row */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="max-w-md w-full">
          <Input
            placeholder="Search by ID, merchant or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="w-4 h-4 text-slate-500" />}
          />
        </div>
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      </div>

      {/* Main Ledger List */}
      <Card className="p-5 bg-white border border-slate-100 shadow-sm" padding="none">
        <div className="divide-y divide-slate-100">
          {filteredTransactions.length === 0 ? (
            <div className="px-5 py-12 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-3">
               <Clock className="w-8 h-8 text-slate-400" />
              <span>No transactions matching criteria.</span>
            </div>
          ) : (
            filteredTransactions.map((tx) => (
              <button
                key={tx.id}
                onClick={() => setSelectedTx(tx)}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                    {getIcon(tx.type)}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold text-slate-800 max-w-[150px] sm:max-w-[280px] truncate">
                      {tx.merchant || tx.description}
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold">{getRelativeTime(tx.timestamp)}</span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5">
                  <span className="text-xs font-bold text-slate-800">
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
            <div className="flex flex-col gap-6 select-none text-slate-800 animate-fade-in">
            <div className="flex flex-col items-center text-center pb-4 border-b border-slate-100">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-3">
                {getIcon(selectedTx.type)}
              </div>
              <h4 className="text-lg font-extrabold text-slate-800">
                {selectedTx.type === 'deposit' ? '+' : '-'}
                {formatCurrency(selectedTx.fiatAmount, activeCurrency)}
              </h4>
              <p className="text-xs text-slate-500 mt-1">{selectedTx.description}</p>
              <Badge variant={getStatusVariant(selectedTx.status)} size="md" className="mt-3 capitalize">
                {selectedTx.status}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-xs">
              <div className="flex flex-col gap-1">
                <span className="text-slate-500 font-semibold uppercase text-[9px] tracking-wider">Order ID</span>
                <span className="font-bold text-slate-800">{selectedTx.id}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-slate-500 font-semibold uppercase text-[9px] tracking-wider">Type</span>
                <span className="font-bold text-slate-800 uppercase">{selectedTx.type === 'bill_payment' ? 'Sell' : selectedTx.type}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-slate-500 font-semibold uppercase text-[9px] tracking-wider">Amount</span>
                <span className="font-bold text-slate-800">
                  {formatCrypto(selectedTx.cryptoAmount, 4)} {selectedTx.token}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-slate-500 font-semibold uppercase text-[9px] tracking-wider">Fee</span>
                <span className="font-bold text-slate-800">
                  {selectedTx.type === 'bill_payment' ? '0.050000 USDC' : '0.00 USDC'}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-slate-500 font-semibold uppercase text-[9px] tracking-wider">Utility Provider Received</span>
                <span className="font-bold text-emerald-600">
                  {formatCurrency(selectedTx.fiatAmount, activeCurrency)}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-slate-500 font-semibold uppercase text-[9px] tracking-wider">Paid By</span>
                <span className="font-mono text-slate-800 font-bold">
                  {selectedTx.walletAddress ? `${selectedTx.walletAddress.slice(0, 6)}...${selectedTx.walletAddress.slice(-4)}` : 'Smart Account'}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-slate-500 font-semibold uppercase text-[9px] tracking-wider">Paid To (Merchant)</span>
                <span className="font-bold text-slate-800">
                  {selectedTx.type === 'bill_payment' ? 'Goofy Faucet Merchant' : 'N/A'}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-slate-500 font-semibold uppercase text-[9px] tracking-wider">Completed In</span>
                <span className="font-bold text-slate-800">
                  {selectedTx.type === 'bill_payment' ? '12s' : 'N/A'}
                </span>
              </div>
              <div className="flex flex-col gap-1 col-span-2">
                <span className="text-slate-500 font-semibold uppercase text-[9px] tracking-wider">Completed At</span>
                <span className="font-bold text-slate-800">{formattedCompletedAt}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-slate-500 font-semibold uppercase text-[9px] tracking-wider">Network</span>
                <span className="font-bold text-slate-800">{selectedTx.network}</span>
              </div>
              {selectedTx.txHash && (
                <div className="col-span-2 flex flex-col gap-1 pt-1">
                  <span className="text-slate-500 font-semibold uppercase text-[9px] tracking-wider">Blockchain Hash</span>
                  <a
                    href={getExplorerUrl(selectedTx.txHash)}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-[10px] text-blue-600 hover:underline break-all"
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
