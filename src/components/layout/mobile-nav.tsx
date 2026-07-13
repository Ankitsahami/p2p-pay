'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Receipt, Wallet, Clock, Settings, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

export const MobileNav = () => {
  const pathname = usePathname();

  const tabs = [
    { label: 'Home', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Pay', href: '/dashboard/pay', icon: Receipt },
    { label: 'Wallet', href: '/dashboard/wallet', icon: Wallet },
    { label: 'History', href: '/dashboard/history', icon: Clock },
    { label: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-xl border-t border-slate-100 z-40 px-6 flex items-center justify-between pb-safe select-none">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href || (tab.href !== '/dashboard' && pathname.startsWith(tab.href + '/'));
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className="flex flex-col items-center justify-center gap-1 text-[10px] font-bold transition-all relative flex-1 text-slate-700"
          >
            <tab.icon
              className={cn(
                'w-5 h-5 transition-transform duration-200',
                isActive ? 'text-blue-500 scale-110' : 'text-slate-400 hover:text-slate-600'
              )}
            />
            <span className={cn(isActive ? 'text-blue-500 font-extrabold' : 'text-slate-400')}>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};
