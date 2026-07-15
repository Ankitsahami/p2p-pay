'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Skeleton = ({ className, ...props }: SkeletonProps) => {
  return (
    <div
      className={cn(
        'rounded-xl w-full h-8 animate-pulse',
        'bg-slate-200/60 dark:bg-white/[0.06]',
        className
      )}
      {...props}
    />
  );
};

export const SkeletonCircle = ({ className, size = 'w-12 h-12', ...props }: SkeletonProps & { size?: string }) => {
  return (
    <div
      className={cn(
        'rounded-full animate-pulse',
        'bg-slate-200/60 dark:bg-white/[0.06]',
        size,
        className
      )}
      {...props}
    />
  );
};

export const SkeletonText = ({
  className,
  lines = 3,
  gap = 'gap-2',
  ...props
}: SkeletonProps & { lines?: number; gap?: string }) => {
  return (
    <div className={cn('flex flex-col w-full', gap, className)} {...props}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={cn(
            'rounded h-4 animate-pulse',
            'bg-slate-200/60 dark:bg-white/[0.06]',
            index === lines - 1 && lines > 1 ? 'w-[60%]' : 'w-full'
          )}
        />
      ))}
    </div>
  );
};

export const SkeletonCard = ({ className, ...props }: SkeletonProps) => {
  return (
    <div
      className={cn(
        'w-full p-6 flex flex-col gap-4 border rounded-2xl',
        'bg-white border-slate-100 dark:bg-white/[0.04] dark:border-white/[0.08]',
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-3">
        <SkeletonCircle size="w-10 h-10" />
        <div className="flex-1 flex flex-col gap-1.5">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/4" />
        </div>
      </div>
      <SkeletonText lines={2} />
    </div>
  );
};
