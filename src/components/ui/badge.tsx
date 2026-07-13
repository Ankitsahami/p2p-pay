'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'processing';
  dot?: boolean;
  size?: 'sm' | 'md';
}

export const Badge = ({
  className,
  children,
  variant = 'neutral',
  dot = false,
  size = 'sm',
  ...props
}: BadgeProps) => {
  const baseStyles = 'inline-flex items-center font-medium rounded-full select-none';

  const variants = {
    success: 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20',
    warning: 'text-amber-400 bg-amber-500/10 border border-amber-500/20',
    error: 'text-red-400 bg-red-500/10 border border-red-500/20',
    info: 'text-blue-400 bg-blue-500/10 border border-blue-500/20',
    neutral: 'text-slate-400 bg-slate-500/10 border border-slate-500/20',
    processing: 'text-blue-400 bg-blue-500/10 border border-blue-500/20 animate-pulse-glow',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[10px] gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
  };

  const dotColors = {
    success: 'bg-emerald-400',
    warning: 'bg-amber-400',
    error: 'bg-red-400',
    info: 'bg-blue-400',
    neutral: 'bg-slate-400',
    processing: 'bg-blue-400 animate-pulse',
  };

  return (
    <span
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full', dotColors[variant])} />}
      {children}
    </span>
  );
};
