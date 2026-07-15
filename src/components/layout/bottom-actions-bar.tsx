'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { QrCode } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useThemeStore } from '@/stores/theme-store';

export function BottomActionsBar() {
  const router = useRouter();
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  const handleScan = () => {
    router.push('/dashboard/pay');
  };

  return (
    <div className="fixed bottom-6 left-0 right-0 md:left-64 z-30 flex justify-center pointer-events-none select-none">
      <div className="flex flex-col items-center pointer-events-auto">
        <button
          onClick={handleScan}
          className={cn(
            "w-16 h-16 bg-blue-600 hover:bg-blue-700 text-white shadow-xl hover:shadow-blue-500/20 rounded-full flex items-center justify-center active:scale-95 transition-all cursor-pointer border-4",
            isDark ? "border-black" : "border-white"
          )}
          title="Scan & Pay"
        >
          <QrCode className="w-7 h-7" />
        </button>
        <span className={cn(
          "text-[10px] font-bold mt-1.5 uppercase tracking-wider backdrop-blur-md px-2.5 py-0.5 rounded-full border shadow-sm transition-all duration-300",
          isDark
            ? "bg-slate-900/80 border-white/10 text-white/70"
            : "bg-white/80 border-slate-100 text-slate-600"
        )}>
          Scan & Pay
        </span>
      </div>
    </div>
  );
}
