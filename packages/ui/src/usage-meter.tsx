import React from 'react';
import { cn } from './utils';

export interface UsageMeterProps {
  label: string;
  current: number;
  max: number;
  unit: string;
  className?: string;
}

export const UsageMeter: React.FC<UsageMeterProps> = ({
  label,
  current,
  max,
  unit,
  className,
}) => {
  const percentage = Math.min(100, Math.round((current / (max || 1)) * 100));
  const isDanger = percentage >= 90;
  const isWarning = percentage >= 75 && percentage < 90;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-700 dark:text-zinc-300 uppercase tracking-wider">{label}</span>
        <span className="text-slate-500 dark:text-zinc-400 font-medium">
          {current} / {max} {unit} ({percentage}%)
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800">
        <div
          className={cn(
            'h-full transition-all duration-300 rounded-full',
            isDanger
              ? 'bg-red-500'
              : isWarning
              ? 'bg-amber-500'
              : 'bg-[#635BFF]'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

