'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { MOCK_ANALYTICS_DATA, MOCK_CATEGORY_ANALYTICS } from '@/lib/mock-data';
import { formatCurrency, formatCompactNumber } from '@/lib/utils';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export default function AdminAnalyticsPage() {
  const chartData = MOCK_ANALYTICS_DATA;
  const categories = MOCK_CATEGORY_ANALYTICS;

  // HSL curated palette
  const COLORS = ['#3B82F6', '#8B5CF6', '#E91E8C', '#10B981', '#FF6B35', '#64748B'];

  return (
    <div className="flex flex-col gap-6 md:gap-8 select-none animate-fade-in text-slate-800">
      {/* Upper Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Growth area graph */}
        <Card className="lg:col-span-2 p-5 bg-white border border-slate-100 shadow-sm" padding="none">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Transaction Volume Dues</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Settle weekly volume trends</p>
          </div>
          <div className="h-72 w-full p-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="date" stroke="#64748B" fontSize={10} tickLine={false} />
                <YAxis
                  stroke="#64748B"
                  fontSize={10}
                  tickLine={false}
                  tickFormatter={(v) => formatCompactNumber(v)}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white border border-slate-200 shadow-xl px-3 py-2 rounded-xl text-xs flex flex-col gap-0.5">
                          <span className="text-slate-500 font-semibold">{payload[0].payload.label}</span>
                          <span className="font-bold text-slate-800">
                            {formatCurrency(payload[0].value as number, 'INR')}
                          </span>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area type="monotone" dataKey="value" stroke="#3B82F6" fillOpacity={1} fill="url(#colorVolume)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Category distribution */}
        <Card className="p-5 bg-white border border-slate-100 shadow-sm" padding="none">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Category Allocations</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Transaction split by utility type</p>
          </div>
          <div className="h-72 w-full flex items-center justify-center p-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <Pie
                  data={categories}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="volume"
                  nameKey="category"
                >
                  {categories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white border border-slate-200 shadow-xl px-3 py-2 rounded-xl text-xs flex flex-col gap-0.5">
                          <span className="font-bold text-slate-800">{data.category}</span>
                          <span className="text-slate-600">
                            {formatCurrency(data.volume, 'INR')} ({data.percentage}%)
                          </span>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Categories table list */}
      <Card className="p-5 bg-white border border-slate-100 shadow-sm" padding="none">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Volumetric Breakdown</h3>
        </div>
        <div className="divide-y divide-slate-100 text-xs">
          {categories.map((cat, index) => (
            <div key={cat.category} className="px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="font-bold text-slate-800">{cat.category}</span>
              </div>
              <div className="flex items-center gap-6">
                <span className="text-slate-500 font-semibold">{cat.count} transfers</span>
                <span className="font-extrabold text-slate-800">{formatCurrency(cat.volume, 'INR')}</span>
                <span className="text-blue-600 font-bold w-12 text-right">{cat.percentage}%</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
