'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Receipt, Wallet, Clock, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useThemeStore } from '@/stores/theme-store';

export const MobileNav = () => {
  const pathname = usePathname();
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  const tabs = [
    { label: 'Home', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Pay', href: '/dashboard/pay', icon: Receipt },
    { label: 'Wallet', href: '/dashboard/wallet', icon: Wallet },
    { label: 'History', href: '/dashboard/history', icon: Clock },
    { label: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  return (
    <nav className={cn(
      "md:hidden fixed bottom-0 left-0 right-0 h-16 border-t z-40 px-6 flex items-center justify-between pb-safe select-none transition-colors duration-300",
      isDark
        ? "bg-black/95 border-white/[0.06] text-white"
        : "bg-white/95 border-slate-100 text-slate-800"
    )}>
      {tabs.map((tab) => {
        const isActive = pathname === tab.href || (tab.href !== '/dashboard' && pathname.startsWith(tab.href + '/'));
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className="flex flex-col items-center justify-center gap-1 text-[10px] font-bold transition-all relative flex-1"
          >
            <tab.icon
              className={cn(
                'w-5 h-5 transition-transform duration-200',
                isActive
                  ? isDark ? 'text-white scale-110' : 'text-blue-500 scale-110'
                  : isDark ? 'text-white/40 hover:text-white/70' : 'text-slate-400 hover:text-slate-600'
              )}
            />
            <span className={cn(
              isActive
                ? isDark ? 'text-white font-extrabold' : 'text-blue-500 font-extrabold'
                : isDark ? 'text-white/40' : 'text-slate-400'
            )}>
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
};
