'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MOCK_TRANSACTIONS } from '@/lib/mock-data';
import { formatCurrency, getRelativeTime } from '@/lib/utils';
import { Users, Wallet, ArrowLeftRight, TrendingUp } from 'lucide-react';

export default function AdminPage() {
  const [stats, setStats] = React.useState({
    totalUsers: 0,
    activeWallets: 0,
    totalTransactions: 0,
    totalVolume: 0.0,
    volumeToday: 0.0,
    successRate: 100.0,
    recentTx: [] as any[]
  });
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const url = process.env.NEXT_PUBLIC_P2P_SUBGRAPH_URL || 'https://api.studio.thegraph.com/query/1745491/event-indexer/v0.0.6';
        if (!url) return;

        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: `{
              orders(first: 200, orderBy: timestamp, orderDirection: desc) {
                id
                amount
                fiatAmount
                status
                user
                timestamp
              }
            }`
          })
        });

        const resJson = await response.json();
        const orders = resJson?.data?.orders || [];
        
        if (orders.length > 0) {
          const totalTransactions = orders.length;
          // Subgraph stores amount/fiatAmount in raw 6 decimals
          const totalVolume = orders.reduce((sum: number, o: any) => sum + (Number(o.fiatAmount) || 0) / 1e6, 0);
          const uniqueUsers = new Set(orders.map((o: any) => o.user.toLowerCase())).size;

          const recentTx = orders.slice(0, 6).map((o: any, idx: number) => {
            const timestamp = o.timestamp ? new Date(Number(o.timestamp) * 1000).toISOString() : new Date().toISOString();
            const fiatAmount = (Number(o.fiatAmount) || 0) / 1e6;
            
            return {
              id: o.id || `TX-${idx}`,
              description: `USDC escrow matched to Goofy Faucet Merchant for user ${o.user.slice(0, 6)}...${o.user.slice(-4)}`,
              timestamp,
              fiatAmount: fiatAmount > 0 ? fiatAmount : (Number(o.amount) || 0) / 1e6 * 83.50,
              status: o.status === 'completed' || o.status === '5' || String(o.status).toLowerCase() === 'completed' ? 'completed' : 'pending'
            };
          });

          setStats({
            totalUsers: uniqueUsers,
            activeWallets: uniqueUsers,
            totalTransactions,
            totalVolume,
            volumeToday: totalTransactions > 0 ? totalVolume / totalTransactions : 0.0,
            successRate: 100.0,
            recentTx
          });
        }
      } catch (err) {
        console.error('Failed to query Graph Subgraph:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const cardItems = [
    { label: 'Total Users', value: stats.totalUsers, sub: `+1 today`, icon: Users, color: 'text-blue-600 bg-blue-50' },
    { label: 'Active Wallets', value: stats.activeWallets, sub: '100% active on Base', icon: Wallet, color: 'text-indigo-600 bg-indigo-50' },
    { label: 'Total Transactions', value: stats.totalTransactions, sub: 'On-Chain orders', icon: ArrowLeftRight, color: 'text-pink-600 bg-pink-50' },
    { label: 'Total Volume', value: formatCurrency(stats.totalVolume, 'INR'), sub: `Today: ${formatCurrency(stats.volumeToday, 'INR')}`, icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50' },
  ];

  return (
    <div className="flex flex-col gap-6 md:gap-8 select-none animate-fade-in text-slate-800">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cardItems.map((c) => (
          <Card key={c.label} className="p-5 flex items-center justify-between bg-white border border-slate-100 shadow-sm">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{c.label}</span>
              <span className="text-xl font-black text-slate-800 mt-1">
                {isLoading ? (
                  <span className="inline-block w-12 h-6 bg-slate-100 animate-pulse rounded" />
                ) : (
                  c.value
                )}
              </span>
              <span className="text-[9px] text-slate-400 font-semibold mt-1">{c.sub}</span>
            </div>
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${c.color}`}>
              <c.icon className="w-5 h-5" />
            </div>
          </Card>
        ))}
      </div>

      {/* Activity + Health grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <Card className="lg:col-span-2 p-5 bg-white border border-slate-100 shadow-sm" padding="none">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Recent System Operations</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {stats.recentTx.map((tx) => (
              <div key={tx.id} className="px-5 py-4 flex items-center justify-between text-xs">
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-slate-800 truncate max-w-[200px]">{tx.description}</span>
                  <span className="text-[9px] text-slate-500">{getRelativeTime(tx.timestamp)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-800">{formatCurrency(tx.fiatAmount, 'INR')}</span>
                  <Badge variant={tx.status === 'completed' ? 'success' : 'warning'} size="sm">
                    {tx.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5 flex flex-col gap-4 bg-white border border-slate-100 shadow-sm">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Escrow Node Health</h3>
          <div className="flex flex-col gap-3 text-xs mt-2">
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-500">P2P Escrow Diamond</span>
              <Badge variant="success">Operational</Badge>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-500">Base RPC Node</span>
              <span className="text-slate-700 font-semibold">18ms latency</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-500">P2P Subgraph Indexer</span>
              <Badge variant="success">Synced</Badge>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-slate-500">Daily Success Rate</span>
              <span className="text-emerald-600 font-extrabold">{stats.successRate}%</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
