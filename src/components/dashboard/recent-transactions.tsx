'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowUpRight, ArrowDownLeft, Receipt, Send, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/hooks/use-wallet';
import { MOCK_TRANSACTIONS } from '@/lib/mock-data';
import { formatCurrency, getRelativeTime, formatCrypto, truncateAddress, getExplorerUrl } from '@/lib/utils';
import { type Transaction } from '@/types';

export const RecentTransactions = () => {
  const { activeCurrency } = useWallet();
  const [selectedTx, setSelectedTx] = React.useState<Transaction | null>(null);

  // Get last 5 transactions
  const transactions = React.useMemo(() => {
    return MOCK_TRANSACTIONS.slice(0, 5);
  }, []);

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
    <Card className="p-5 select-none bg-white border border-slate-100 shadow-sm" padding="none">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Recent Transactions</h3>
          <p className="text-[10px] text-slate-500 mt-0.5">Your latest billing and transfer activities</p>
        </div>
        <Link
          href="/dashboard/history"
          className="text-xs font-semibold text-blue-500 hover:text-blue-600 flex items-center gap-0.5 group"
        >
          <span>View All</span>
          <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      <div className="divide-y divide-slate-100">
        {transactions.length === 0 ? (
          <div className="px-5 py-8 text-center text-xs text-slate-500">
            No transactions found
          </div>
        ) : (
          transactions.map((tx) => (
            <button
              key={tx.id}
              onClick={() => setSelectedTx(tx)}
              className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                  {getIcon(tx.type)}
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-slate-800 max-w-[150px] sm:max-w-[240px] truncate">
                    {tx.merchant || tx.description}
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold">{getRelativeTime(tx.timestamp)}</span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1.5">
                <span className="text-xs font-bold text-slate-900">
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
          <div className="flex flex-col gap-6 select-none text-slate-850">
            {/* Header Status */}
            <div className="flex flex-col items-center text-center pb-4 border-b border-slate-100">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-3">
                {getIcon(selectedTx.type)}
              </div>
              <h4 className="text-lg font-extrabold text-slate-900">
                {selectedTx.type === 'deposit' ? '+' : '-'}
                {formatCurrency(selectedTx.fiatAmount, activeCurrency)}
              </h4>
              <p className="text-xs text-slate-500 mt-1">{selectedTx.description}</p>
              <Badge variant={getStatusVariant(selectedTx.status)} size="md" className="mt-3 capitalize">
                {selectedTx.status}
              </Badge>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-xs">
              <div className="flex flex-col gap-1">
                <span className="text-slate-500 font-semibold uppercase text-[9px] tracking-wider">Transaction ID</span>
                <span className="font-bold text-slate-800">{selectedTx.id}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-slate-500 font-semibold uppercase text-[9px] tracking-wider">Asset Dues</span>
                <span className="font-bold text-slate-800">
                  {formatCrypto(selectedTx.cryptoAmount, 4)} {selectedTx.token}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-slate-500 font-semibold uppercase text-[9px] tracking-wider">Network</span>
                <span className="font-bold text-slate-800">{selectedTx.network}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-slate-500 font-semibold uppercase text-[9px] tracking-wider">Timestamp</span>
                <span className="font-bold text-slate-800">
                  {new Date(selectedTx.timestamp).toLocaleString()}
                </span>
              </div>
              {selectedTx.txHash && (
                <div className="col-span-2 flex flex-col gap-1">
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
