'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs } from '@/components/ui/tabs';
import { formatCurrency, truncateAddress, getRelativeTime, getExplorerUrl } from '@/lib/utils';
import { Search, Receipt, ArrowDownLeft, ArrowUpRight, Send, Clock, Eye } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';

export default function AdminTransactionsPage() {
  const [search, setSearch] = React.useState('');
  const [activeTab, setActiveTab] = React.useState('all');
  const [selectedTx, setSelectedTx] = React.useState<any | null>(null);

  const tabs = [
    { id: 'all', label: 'All Operations' },
    { id: 'bill_payment', label: 'Bill Payments' },
    { id: 'deposit', label: 'Deposits' },
    { id: 'send', label: 'Sends' },
  ];

  const getIcon = (type: string) => {
    const styles = 'w-4 h-4 flex-shrink-0';
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

  const [transactions, setTransactions] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchTxs = async () => {
      try {
        const res = await fetch('/api/transactions');
        const result = await res.json();
        if (result.success && result.data) {
          setTransactions(result.data);
        }
      } catch (err) {
        console.error('Failed to fetch transactions:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTxs();
  }, []);

  const filteredTransactions = React.useMemo(() => {
    return transactions.filter((tx) => {
      const tabMatch = activeTab === 'all' || tx.type === activeTab;
      const searchLower = search.toLowerCase();
      const searchMatch =
        !search.trim() ||
        tx.description.toLowerCase().includes(searchLower) ||
        tx.id.toLowerCase().includes(searchLower) ||
        tx.walletAddress.toLowerCase().includes(searchLower);

      return tabMatch && searchMatch;
    });
  }, [activeTab, search, transactions]);

  return (
    <div className="flex flex-col gap-6 md:gap-8 select-none animate-fade-in text-slate-800">
      {/* Header Search Filter Panel */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="max-w-md w-full">
          <Input
            placeholder="Search by ID, wallet address or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="w-4 h-4 text-slate-500" />}
          />
        </div>
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      </div>

      {/* Main Table Card */}
      <Card className="overflow-hidden bg-white border border-slate-100 shadow-sm" padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-500 select-none">
                <th className="p-4 font-bold">Transaction ID</th>
                <th className="p-4 font-bold">Wallet Address</th>
                <th className="p-4 font-bold">Type</th>
                <th className="p-4 font-bold">Outstanding Dues</th>
                <th className="p-4 font-bold">Asset Type</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold">Time</th>
                <th className="p-4 font-bold text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500 font-semibold select-none">
                    No transactions matching search criteria.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="p-4 font-bold text-slate-800">{tx.id}</td>
                    <td className="p-4 font-mono text-[10px] text-slate-500">
                      {truncateAddress(tx.walletAddress, 8, 6)}
                    </td>
                    <td className="p-4">
                      <span className="flex items-center gap-2">
                        {getIcon(tx.type)}
                        <span className="capitalize">{tx.type.replace('_', ' ')}</span>
                      </span>
                    </td>
                    <td className="p-4 font-bold text-slate-800">{formatCurrency(tx.fiatAmount, 'INR')}</td>
                    <td className="p-4 font-semibold text-slate-600">{tx.token} on Base</td>
                    <td className="p-4">
                      <Badge variant={getStatusVariant(tx.status)} size="sm">
                        {tx.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-slate-500">{getRelativeTime(tx.timestamp)}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedTx(tx)}
                        className="p-1.5 rounded-lg border border-slate-100 bg-slate-50 hover:bg-slate-100 active:scale-95 text-slate-500 hover:text-slate-700 transition-all cursor-pointer"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Transaction Details Modal */}
      <Modal
        isOpen={!!selectedTx}
        onClose={() => setSelectedTx(null)}
        title="Admin Transaction Details"
        size="md"
      >
        {selectedTx && (
          <div className="flex flex-col gap-6 select-none text-slate-800">
            <div className="flex flex-col items-center text-center pb-4 border-b border-slate-100">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-3">
                {getIcon(selectedTx.type)}
              </div>
              <h4 className="text-lg font-extrabold text-slate-800">
                {formatCurrency(selectedTx.fiatAmount, 'INR')}
              </h4>
              <p className="text-xs text-slate-500 mt-1">{selectedTx.description}</p>
              <Badge variant={getStatusVariant(selectedTx.status)} size="md" className="mt-3 capitalize">
                {selectedTx.status}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-xs">
              <div className="flex flex-col gap-1">
                <span className="text-slate-500 font-semibold uppercase text-[9px] tracking-wider">User Wallet</span>
                <span className="font-mono text-[10px] text-slate-850 select-all">{selectedTx.walletAddress}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-slate-500 font-semibold uppercase text-[9px] tracking-wider">Transaction ID</span>
                <span className="font-bold text-slate-800">{selectedTx.id}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-slate-500 font-semibold uppercase text-[9px] tracking-wider">Crypto Dues</span>
                <span className="font-bold text-slate-800">{selectedTx.cryptoAmount} {selectedTx.token}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-slate-500 font-semibold uppercase text-[9px] tracking-wider">Sepolia Network</span>
                <span className="font-bold text-slate-800">{selectedTx.network}</span>
              </div>
              <div className="col-span-2 flex flex-col gap-1 border-t border-slate-100 pt-3">
                <span className="text-slate-500 font-semibold uppercase text-[9px] tracking-wider">Sepolia Blockchain Tx Hash</span>
                <a
                  href={getExplorerUrl(selectedTx.txHash)}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-[10px] text-blue-600 hover:underline break-all"
                >
                  {selectedTx.txHash || 'Pending creation'}
                </a>
              </div>
            </div>

            <Button variant="secondary" className="w-full mt-2" onClick={() => setSelectedTx(null)}>
              Dismiss Ledger
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
