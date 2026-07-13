'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, Zap, Droplets, Flame, Smartphone, Tv, Wifi, Car, CreditCard, Shield, Building2, GraduationCap, Home } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { BILL_CATEGORIES } from '@/lib/bill-categories';

export default function PayPage() {
  const [search, setSearch] = React.useState('');

  const filteredCategories = React.useMemo(() => {
    if (!search.trim()) return BILL_CATEGORIES;
    return BILL_CATEGORIES.filter((cat) =>
      cat.name.toLowerCase().includes(search.toLowerCase()) ||
      cat.description.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  // Icons map matching categories configuration
  const iconMap: Record<string, any> = {
    Zap,
    Droplets,
    Flame,
    Smartphone,
    Tv,
    Wifi,
    Car,
    CreditCard,
    Shield,
    Building2,
    GraduationCap,
    Home,
  };

  const getIcon = (iconName: string, color: string) => {
    const Icon = iconMap[iconName] || Zap;
    return <Icon className="w-5 h-5" style={{ color }} />;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.03 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 150, damping: 15 } },
  };

  return (
    <div className="flex flex-col gap-6 md:gap-8 select-none">
      {/* Category Search Header */}
      <div className="flex flex-col gap-4 max-w-xl">
        <Input
          placeholder="Search utility, recharge, or provider name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={<Search className="w-4 h-4 text-slate-500" />}
          className="bg-white border-slate-200 text-slate-850"
        />
      </div>

      {/* Grid of Categories */}
      {filteredCategories.length === 0 ? (
        <div className="text-center py-12 text-slate-500 text-xs font-semibold">
          No matching bill categories found.
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
            All Bill Categories
          </span>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            {filteredCategories.map((cat) => (
              <motion.div key={cat.id} variants={itemVariants} className="h-full">
                <Link href={`/dashboard/pay/${cat.id}`} className="block h-full">
                  <Card className="p-5 flex items-start gap-4 hover:border-slate-300 hover:shadow-sm active:scale-98 transition-all h-full bg-white border border-slate-100">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0">
                      {getIcon(cat.icon, cat.color)}
                    </div>
                    <div className="flex flex-col gap-1 overflow-hidden">
                      <h4 className="text-xs font-bold text-slate-800 truncate">{cat.name}</h4>
                      <p className="text-[10px] text-slate-500 leading-relaxed text-ellipsis-2">
                        {cat.description}
                      </p>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}
    </div>
  );
}
