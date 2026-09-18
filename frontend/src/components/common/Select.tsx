import React, { SelectHTMLAttributes, forwardRef, ReactNode } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: string;
  children: ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, icon, children, className, id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label htmlFor={selectId} className="block text-label-sm text-on-surface font-semibold">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <span className="material-symbols-outlined absolute left-3 text-outline text-xl pointer-events-none">
              {icon}
            </span>
          )}
          <select
            ref={ref}
            id={selectId}
            className={twMerge(
              clsx(
                'w-full bg-white border border-outline-variant text-on-surface text-sm rounded px-3.5 py-2.5 transition-colors focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none cursor-pointer pr-10',
                icon && 'pl-10',
                error && 'border-error focus:border-error focus:ring-error',
                className
              )
            )}
            {...props}
          >
            {children}
          </select>
          <span className="material-symbols-outlined absolute right-3 text-outline text-lg pointer-events-none">
            expand_more
          </span>
        </div>
        {error ? (
          <p className="text-xs text-error font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-on-surface-variant">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = 'Select';
