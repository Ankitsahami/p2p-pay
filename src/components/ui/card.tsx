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
          'glass-card-static',
          hover && 'hover:bg-white/[0.06] hover:border-white/20 transition-all duration-300',
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
