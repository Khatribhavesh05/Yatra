import React, { ReactNode } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'neutral';
  size?: 'sm' | 'md';
  icon?: string;
  dot?: boolean;
  children: ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  dot,
  children,
  className,
}) => {
  const variantStyles = {
    primary: 'bg-primary-container/10 text-primary border border-primary/20',
    secondary: 'bg-secondary-container text-secondary border border-secondary/20',
    success: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border border-amber-200',
    error: 'bg-error-container text-error border border-error/20',
    neutral: 'bg-surface-container text-on-surface-variant border border-outline-variant',
  };

  const dotColors = {
    primary: 'bg-primary',
    secondary: 'bg-secondary',
    success: 'bg-emerald-600',
    warning: 'bg-amber-600',
    error: 'bg-error',
    neutral: 'bg-outline',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 font-label-sm rounded-sm',
    md: 'text-xs px-2.5 py-1 font-label-bold rounded',
  };

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center gap-1.5 uppercase tracking-wider',
          variantStyles[variant],
          sizeStyles[size],
          className
        )
      )}
    >
      {dot && <span className={clsx('w-1.5 h-1.5 rounded-full', dotColors[variant])} />}
      {icon && <span className="material-symbols-outlined text-sm">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
