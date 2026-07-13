'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { QrCode } from 'lucide-react';

export function BottomActionsBar() {
  const router = useRouter();

  const handleScan = () => {
    router.push('/dashboard/pay');
  };

  return (
    <div className="fixed bottom-6 left-0 right-0 md:left-64 z-30 flex justify-center pointer-events-none select-none">
      <div className="flex flex-col items-center pointer-events-auto">
        <button
          onClick={handleScan}
          className="w-16 h-16 bg-blue-600 hover:bg-blue-700 text-white shadow-xl hover:shadow-blue-500/20 rounded-full flex items-center justify-center active:scale-95 transition-all cursor-pointer border-4 border-white"
          title="Scan & Pay"
        >
          <QrCode className="w-7 h-7" />
        </button>
        <span className="text-[10px] font-bold text-slate-600 mt-1.5 uppercase tracking-wider bg-white/80 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-slate-100 shadow-sm">
          Scan & Pay
        </span>
      </div>
    </div>
  );
}
