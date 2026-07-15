'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

export interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export const Tabs = ({ tabs, activeTab, onChange, className }: TabsProps) => {
  const layoutId = React.useId();

  return (
    <div
      role="tablist"
      className={cn(
        'inline-flex items-center p-1 rounded-xl scrollbar-hide select-none overflow-x-auto w-full max-w-max',
        // Light
        'bg-slate-100 border border-slate-200',
        // Dark
        'dark:bg-white/5 dark:border-white/[0.08]',
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={cn(
              'relative px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 focus:outline-none cursor-pointer whitespace-nowrap',
              isActive
                ? 'text-slate-900 dark:text-white'
                : 'text-slate-500 dark:text-white/40 hover:text-slate-900 dark:hover:text-white'
            )}
          >
            {isActive && (
              <motion.div
                layoutId={layoutId}
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                className="absolute inset-0 bg-white dark:bg-white/10 rounded-lg -z-10 shadow-sm dark:shadow-none"
              />
            )}
            {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};
