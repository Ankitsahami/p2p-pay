'use client';

import * as React from 'react';
import { WalletCard } from '@/components/dashboard/wallet-card';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { RecentTransactions } from '@/components/dashboard/recent-transactions';
import { SavedBillers } from '@/components/dashboard/saved-billers';

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6 md:gap-8 select-none">
      {/* Upper Layout */}
      <div className="flex flex-col gap-6">
        {/* Main Balance Asset Card */}
        <WalletCard />
        {/* Navigation Action Buttons Grid */}
        <QuickActions />
      </div>

      {/* Saved Accounts Row */}
      <SavedBillers />

      {/* History Ledger List */}
      <RecentTransactions />
    </div>
  );
}

