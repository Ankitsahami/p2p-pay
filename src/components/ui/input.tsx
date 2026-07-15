'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', label, error, icon, id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-semibold text-slate-500 dark:text-white/50 select-none">
            {label}
          </label>
        )}
        <div className="relative w-full">
          {icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/40 pointer-events-none flex items-center justify-center">
              {icon}
            </div>
          )}
          <input
            id={inputId}
            type={type}
            ref={ref}
            className={cn(
              'w-full px-4 py-3 rounded-xl text-sm transition-all',
              // Light
              'bg-slate-50 border border-slate-200 text-slate-950 placeholder:text-slate-400 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20',
              // Dark
              'dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder:text-white/30 dark:focus:border-blue-500/40 dark:focus:ring-blue-500/10',
              'disabled:opacity-50 disabled:pointer-events-none',
              icon && 'pl-11',
              error && 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20 dark:border-red-500/30',
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <span className="text-xs text-red-400 select-none animate-fade-in">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
