'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Receipt, ArrowDownLeft, ArrowUpRight, Send, QrCode } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useThemeStore } from '@/stores/theme-store';
import { cn } from '@/lib/utils';

export const QuickActions = () => {
  const router = useRouter();
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  const actions = [
    {
      label: 'Pay Bills',
      icon: Receipt,
      href: '/dashboard/pay',
      color: 'text-blue-600 bg-blue-50 border-blue-100 dark:text-blue-400 dark:bg-blue-500/10 dark:border-blue-500/25',
    },
    {
      label: 'Deposit',
      icon: ArrowDownLeft,
      href: '/dashboard/wallet/deposit',
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/25',
    },
    {
      label: 'Send Crypto',
      icon: Send,
      href: '/dashboard/wallet/send',
      color: 'text-indigo-600 bg-indigo-50 border-indigo-100 dark:text-indigo-400 dark:bg-indigo-500/10 dark:border-indigo-500/25',
    },
    {
      label: 'Receive Dues',
      icon: QrCode,
      href: '/dashboard/wallet',
      color: 'text-pink-600 bg-pink-50 border-pink-100 dark:text-pink-400 dark:bg-pink-500/10 dark:border-pink-500/25',
    },
    {
      label: 'Withdraw',
      icon: ArrowUpRight,
      href: '/dashboard/wallet/send',
      color: 'text-amber-600 bg-amber-50 border-amber-100 dark:text-amber-400 dark:bg-amber-500/10 dark:border-amber-500/25',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 200, damping: 20 } },
  };

  return (
    <Card className="p-0 select-none overflow-hidden" padding="none">
      <div className={cn("px-5 py-4 border-b", isDark ? "border-white/5" : "border-slate-100")}>
        <h3 className={cn("text-sm font-bold", isDark ? "text-white" : "text-slate-800")}>Quick Actions</h3>
      </div>
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4"
      >
        {actions.map((act) => (
          <motion.button
            key={act.label}
            variants={itemVariants}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push(act.href)}
            className={cn(
              "flex flex-col items-center justify-center p-4 border rounded-2xl transition-all cursor-pointer group",
              isDark
                ? "bg-white/5 border-white/[0.06] hover:bg-white/10 hover:border-white/20"
                : "bg-slate-50 border-slate-100 hover:bg-slate-100 hover:border-slate-200 hover:shadow-sm"
            )}
          >
            <div className={cn("w-11 h-11 rounded-xl border flex items-center justify-center transition-transform group-hover:scale-105 duration-200", act.color)}>
              <act.icon className="w-5 h-5" />
            </div>
            <span className={cn(
              "text-[11px] font-bold mt-3 text-center transition-colors",
              isDark
                ? "text-white/60 group-hover:text-white"
                : "text-slate-600 group-hover:text-blue-600"
            )}>
              {act.label}
            </span>
          </motion.button>
        ))}
      </motion.div>
    </Card>
  );
};
