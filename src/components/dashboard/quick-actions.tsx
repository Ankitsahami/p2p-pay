'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Receipt, ArrowDownLeft, ArrowUpRight, Send, QrCode, ScanLine } from 'lucide-react';
import { Card } from '@/components/ui/card';

export const QuickActions = () => {
  const router = useRouter();

  const actions = [
    { label: 'Pay Bills', icon: Receipt, href: '/dashboard/pay', color: 'text-blue-600 bg-blue-50 border-blue-100' },
    { label: 'Deposit', icon: ArrowDownLeft, href: '/dashboard/wallet/deposit', color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
    { label: 'Send Crypto', icon: Send, href: '/dashboard/wallet/send', color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
    { label: 'Receive Dues', icon: QrCode, href: '/dashboard/wallet', color: 'text-pink-600 bg-pink-50 border-pink-100' },
    { label: 'Withdraw', icon: ArrowUpRight, href: '/dashboard/wallet/send', color: 'text-amber-600 bg-amber-50 border-amber-100' },
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
    <Card className="p-5 select-none bg-white border border-slate-100 shadow-sm" padding="none">
      <div className="px-5 py-4 border-b border-slate-100">
        <h3 className="text-sm font-bold text-slate-800">Quick Actions</h3>
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
            className="flex flex-col items-center justify-center p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-slate-100 hover:border-slate-200 hover:shadow-sm transition-all cursor-pointer group"
          >
            <div className={`w-11 h-11 rounded-xl border flex items-center justify-center ${act.color} transition-transform group-hover:scale-105 duration-200`}>
              <act.icon className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-slate-600 group-hover:text-blue-600 mt-3 text-center transition-colors">
              {act.label}
            </span>
          </motion.button>
        ))}
      </motion.div>
    </Card>
  );
};
