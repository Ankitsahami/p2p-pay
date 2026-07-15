'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, Zap, Droplets, Flame, Smartphone, Tv, Wifi, Car, CreditCard, Shield, Building2, GraduationCap, Home } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { BILL_CATEGORIES } from '@/lib/bill-categories';
import { useThemeStore } from '@/stores/theme-store';
import { cn } from '@/lib/utils';

export default function PayPage() {
  const [search, setSearch] = React.useState('');
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

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
          icon={<Search className="w-4 h-4 text-slate-400 dark:text-white/40" />}
          className=""
        />
      </div>

      {/* Grid of Categories */}
      {filteredCategories.length === 0 ? (
        <div className={cn("text-center py-12 text-xs font-semibold", isDark ? "text-white/40" : "text-slate-500")}>
          No matching bill categories found.
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <span className={cn("text-[10px] font-bold tracking-widest uppercase", isDark ? "text-white/40" : "text-slate-500")}>
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
                  <Card className="p-5 flex items-start gap-4 active:scale-98 transition-all h-full">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border",
                      isDark ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-100"
                    )}>
                      {getIcon(cat.icon, cat.color)}
                    </div>
                    <div className="flex flex-col gap-1 overflow-hidden">
                      <h4 className={cn("text-xs font-bold truncate", isDark ? "text-white" : "text-slate-800")}>{cat.name}</h4>
                      <p className={cn("text-[10px] leading-relaxed text-ellipsis-2", isDark ? "text-white/50" : "text-slate-500")}>
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
