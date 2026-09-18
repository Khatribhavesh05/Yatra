import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
  iconTrailing?: string;
  children?: ReactNode;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  iconTrailing,
  children,
  loading = false,
  className,
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-label-bold transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed select-none rounded';

  const variantStyles = {
    primary:
      'bg-primary text-on-primary hover:bg-on-primary-fixed-variant shadow-sm active:translate-y-[1px]',
    secondary:
      'bg-secondary-container text-on-secondary-container hover:bg-secondary-fixed active:translate-y-[1px]',
    outline:
      'border border-outline-variant text-primary bg-white hover:bg-primary-container/10 active:translate-y-[1px]',
    ghost:
      'text-on-surface-variant hover:text-primary hover:bg-surface-container-low active:translate-y-[1px]',
    danger:
      'bg-error text-white hover:bg-on-error-container active:translate-y-[1px]',
  };

  const sizeStyles = {
    sm: 'text-label-sm px-3 py-1.5 gap-1.5 text-xs',
    md: 'text-label-bold px-5 py-2.5 gap-2 text-sm',
    lg: 'text-label-bold px-6 py-3.5 gap-2.5 text-base',
  };

  return (
    <button
      className={twMerge(clsx(baseStyles, variantStyles[variant], sizeStyles[size], className))}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
      ) : icon ? (
        <span className="material-symbols-outlined text-lg">{icon}</span>
      ) : null}
      {children}
      {iconTrailing && !loading && (
        <span className="material-symbols-outlined text-lg">{iconTrailing}</span>
      )}
    </button>
  );
};
