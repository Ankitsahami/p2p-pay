'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

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
        <label id={labelId} className="text-xs font-semibold text-slate-400 select-none">
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
            'w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-left text-slate-950 flex items-center justify-between focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 disabled:opacity-50 disabled:pointer-events-none transition-all cursor-pointer select-none',
            error && 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20'
          )}
        >
          <span className="flex items-center gap-2">
            {selectedOption?.icon && <span className="flex-shrink-0">{selectedOption.icon}</span>}
            <span className={cn(!selectedOption && 'text-slate-400')}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>
          </span>
          <ChevronDown
            className={cn('w-4 h-4 text-slate-500 transition-transform duration-200', isOpen && 'rotate-180')}
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
              className="absolute z-30 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto scrollbar-hide py-1"
            >
              {options.length === 0 ? (
                <li className="px-4 py-3 text-xs text-slate-400 text-center select-none">
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
                        'w-full px-4 py-2.5 text-sm text-left hover:bg-slate-50 transition-colors flex items-center gap-2 cursor-pointer',
                        opt.value === value ? 'text-blue-600 bg-blue-50 font-bold' : 'text-slate-700'
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
