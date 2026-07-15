'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg' | 'none';
  gradient?: string;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, hover = true, padding = 'md', gradient, ...props }, ref) => {
    const paddings = {
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
      none: 'p-0',
    };

    return (
      <div
        ref={ref}
        className={cn(
          // Light mode: white/glass card
          'bg-white border border-slate-100 rounded-2xl shadow-sm',
          // Dark mode: liquid-glass
          'dark:bg-white/[0.04] dark:border-white/[0.08] dark:shadow-none dark:backdrop-blur-md',
          hover && 'hover:border-slate-200 dark:hover:bg-white/[0.07] dark:hover:border-white/[0.12] transition-all duration-300',
          paddings[padding],
          className
        )}
        {...props}
      >
        {gradient && (
          <div className={cn('absolute inset-t-0 inset-x-0 h-1.5 rounded-t-2xl bg-gradient-to-r', gradient)} />
        )}
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
