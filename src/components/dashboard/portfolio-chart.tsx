'use client';

import * as React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Card } from '@/components/ui/card';
import { useWallet } from '@/hooks/use-wallet';
import { formatCurrency, formatCrypto } from '@/lib/utils';

export const PortfolioChart = () => {
  const { balances, activeCurrency } = useWallet();

  const data = React.useMemo(() => {
    return balances.map((bal) => ({
      name: bal.token.symbol,
      value: bal.usdValue,
      fiatValue: bal.fiatValue,
      balance: bal.balance,
    }));
  }, [balances]);

  // Color mapping corresponding to token symbols
  const colors: Record<string, string> = {
    USDC: '#3B82F6', // Blue
    WETH: '#8B5CF6', // Purple/Violet
    USDT: '#10B981', // Green
    DAI: '#F59E0B',  // Amber
  };

  const totalValue = data.reduce((sum, item) => sum + item.fiatValue, 0);

  return (
    <Card className="flex flex-col select-none bg-white border border-slate-100 shadow-sm" padding="none">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Crypto Portfolio</h3>
          <p className="text-[10px] text-slate-500 mt-0.5">Asset allocation by dollar value</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-6 py-6 min-h-[220px]">
        {/* Recharts Pie Chart */}
        {data.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-xs text-slate-500">
            No assets found
          </div>
        ) : (
          <>
            <div className="w-40 h-40 flex-shrink-0 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="fiatValue"
                  >
                    {data.map((entry) => (
                      <Cell key={`cell-${entry.name}`} fill={colors[entry.name] || '#64748B'} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const payloadData = payload[0].payload;
                        return (
                          <div className="bg-[#0d0d0d] border border-white/10 px-3 py-2 rounded-xl text-xs flex flex-col gap-0.5">
                            <span className="font-bold text-white">{payloadData.name}</span>
                            <span className="text-slate-300">
                              {formatCurrency(payloadData.fiatValue, activeCurrency)}
                            </span>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Centered Net Worth Indicator inside Donut */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Total Value</span>
                <span className="text-sm font-bold text-slate-900 mt-0.5 truncate max-w-[120px]">
                  {formatCurrency(totalValue, activeCurrency)}
                </span>
              </div>
            </div>

            {/* Legend Datalist */}
            <div className="flex-1 flex flex-col gap-3 w-full">
              {balances.map((bal) => {
                const percent = totalValue > 0 ? (bal.fiatValue / totalValue) * 100 : 0;
                const tokenColor = colors[bal.token.symbol] || '#64748B';
                return (
                  <div key={bal.token.symbol} className="flex items-center justify-between text-xs p-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tokenColor }} />
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800">{bal.token.symbol}</span>
                        <span className="text-[10px] text-slate-500">
                          {formatCrypto(bal.balance, 4)} {bal.token.symbol}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="font-bold text-slate-900">
                        {formatCurrency(bal.fiatValue, activeCurrency)}
                      </span>
                      <span className="text-[10px] text-slate-500 font-semibold">{percent.toFixed(1)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </Card>
  );
};
