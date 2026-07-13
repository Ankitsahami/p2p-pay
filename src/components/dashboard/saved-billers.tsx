'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Zap, Droplets, Flame, Smartphone, Tv, Wifi } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useUserStore } from '@/stores/user-store';
import { useWallet } from '@/hooks/use-wallet';
import { formatCurrency } from '@/lib/utils';

export const SavedBillers = () => {
  const router = useRouter();
  const { savedBillers } = useUserStore();
  const { activeCurrency } = useWallet();

  const getCategoryIcon = (category: string) => {
    const styles = 'w-4 h-4 text-white';
    if (category === 'electricity') return <div className="p-2 rounded-lg bg-amber-500"><Zap className={styles} /></div>;
    if (category === 'water') return <div className="p-2 rounded-lg bg-cyan-500"><Droplets className={styles} /></div>;
    if (category === 'gas') return <div className="p-2 rounded-lg bg-orange-500"><Flame className={styles} /></div>;
    if (category === 'mobile') return <div className="p-2 rounded-lg bg-purple-500"><Smartphone className={styles} /></div>;
    if (category === 'dth') return <div className="p-2 rounded-lg bg-pink-500"><Tv className={styles} /></div>;
    return <div className="p-2 rounded-lg bg-blue-500"><Wifi className={styles} /></div>;
  };

  return (
    <div className="flex flex-col gap-4 select-none">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Saved Billers</h3>
          <p className="text-[10px] text-slate-500 mt-0.5">Quick access to frequent accounts</p>
        </div>
      </div>

      <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {/* Saved Cards */}
        {savedBillers.map((biller) => (
          <Card
            key={biller.id}
            onClick={() => router.push(`/dashboard/pay/${biller.category}?providerId=${biller.provider.id}&consumerNumber=${biller.consumerNumber}`)}
            className="flex-shrink-0 w-44 p-4 flex flex-col gap-3 justify-between cursor-pointer border border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm transition-all"
          >
            <div className="flex items-start justify-between">
              {getCategoryIcon(biller.category)}
              <span className="text-[9px] font-bold text-slate-500 uppercase truncate max-w-[80px]">
                {biller.provider.name}
              </span>
            </div>

            <div className="flex flex-col gap-0.5 mt-2">
              <h4 className="text-xs font-bold text-slate-800 truncate">
                {biller.nickname || biller.consumerName}
              </h4>
              <span className="text-[9px] text-slate-500 font-semibold truncate">
                {biller.consumerNumber}
              </span>
            </div>

            {biller.lastPaidAmount && (
              <div className="border-t border-slate-100 pt-2 mt-1 flex justify-between text-[9px] text-slate-500 font-medium">
                <span>Last Paid</span>
                <span className="font-bold text-slate-800">
                  {formatCurrency(biller.lastPaidAmount, activeCurrency)}
                </span>
              </div>
            )}
          </Card>
        ))}

        {/* Add Biller Action Card */}
        <button
          onClick={() => router.push('/dashboard/pay')}
          className="flex-shrink-0 w-44 h-[130px] rounded-2xl border border-dashed border-slate-200 hover:border-slate-400 bg-white flex flex-col items-center justify-center gap-2 hover:bg-slate-50 active:scale-95 transition-all text-slate-500 hover:text-slate-700 cursor-pointer shadow-sm"
        >
          <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl">
            <Plus className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider">Add New Biller</span>
        </button>
      </div>
    </div>
  );
};
