'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useThemeStore } from '@/stores/theme-store';

export interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

export interface SelectProps {
  label?: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  className?: string;
}

export const Select = ({
  label,
  options,
  value,
  onChange,
  placeholder = 'Select option',
  error,
  className,
}: SelectProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const labelId = React.useId();
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  const selectedOption = options.find((opt) => opt.value === value);

  // Close dropdown on outside click
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={cn('relative w-full flex flex-col gap-1.5', className)}>
      {label && (
        <label id={labelId} className="text-xs font-semibold text-slate-400 dark:text-white/50 select-none">
          {label}
        </label>
      )}
      <div className="relative w-full">
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-labelledby={label ? labelId : undefined}
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'w-full px-4 py-3 rounded-xl text-sm text-left flex items-center justify-between transition-all cursor-pointer select-none border',
            // Light
            'bg-slate-50 border-slate-200 text-slate-950 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 disabled:opacity-50 disabled:pointer-events-none',
            // Dark
            'dark:bg-white/5 dark:border-white/10 dark:text-white dark:focus:border-blue-500/40 dark:focus:ring-blue-500/10',
            error && 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20'
          )}
        >
          <span className="flex items-center gap-2">
            {selectedOption?.icon && <span className="flex-shrink-0">{selectedOption.icon}</span>}
            <span className={cn(!selectedOption && (isDark ? 'text-white/30' : 'text-slate-400'))}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>
          </span>
          <ChevronDown
            className={cn('w-4 h-4 transition-transform duration-200', isDark ? 'text-white/40' : 'text-slate-500', isOpen && 'rotate-180')}
          />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.ul
              role="listbox"
              aria-activedescendant={value}
              initial={{ opacity: 0, y: 4, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.98 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className={cn(
                'absolute z-30 w-full mt-2 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto scrollbar-hide py-1 border',
                // Light
                'bg-white border-slate-200',
                // Dark
                'dark:bg-[#111] dark:border-white/10'
              )}
            >
              {options.length === 0 ? (
                <li className="px-4 py-3 text-xs text-slate-400 dark:text-white/30 text-center select-none">
                  No options available
                </li>
              ) : (
                options.map((opt) => (
                  <li key={opt.value}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={opt.value === value}
                      onClick={() => {
                        onChange(opt.value);
                        setIsOpen(false);
                      }}
                      className={cn(
                        'w-full px-4 py-2.5 text-sm text-left transition-colors flex items-center gap-2 cursor-pointer',
                        // Active / inactive styles
                        opt.value === value
                          ? isDark
                            ? 'text-white bg-white/10 font-bold'
                            : 'text-blue-600 bg-blue-50 font-bold'
                          : isDark
                            ? 'text-white/70 hover:bg-white/5 hover:text-white'
                            : 'text-slate-700 hover:bg-slate-50'
                      )}
                    >
                      {opt.icon && <span className="flex-shrink-0">{opt.icon}</span>}
                      <span>{opt.label}</span>
                    </button>
                  </li>
                ))
              )}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
      {error && (
        <span className="text-xs text-red-400 select-none animate-fade-in">
          {error}
        </span>
      )}
    </div>
  );
};
