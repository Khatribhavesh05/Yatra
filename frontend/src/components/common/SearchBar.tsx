import React, { ChangeEvent, FormEvent } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  className?: string;
  onClear?: () => void;
  autoFocus?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onSubmit,
  placeholder = 'Search by name, route, stop, or address...',
  className,
  onClear,
  autoFocus,
}) => {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (onSubmit) onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className={twMerge(clsx('relative flex items-center w-full', className))}>
      <span className="material-symbols-outlined absolute left-3.5 text-primary text-xl pointer-events-none">
        search
      </span>
      <input
        type="text"
        value={value}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="w-full bg-white border border-outline-variant text-on-surface placeholder:text-outline text-sm rounded-lg pl-11 pr-10 py-3 shadow-sm transition-all focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
      {value && (
        <button
          type="button"
          onClick={() => {
            onChange('');
            if (onClear) onClear();
          }}
          className="absolute right-3 p-1 text-outline hover:text-on-surface rounded-full hover:bg-surface-container transition-colors"
          aria-label="Clear search"
        >
          <span className="material-symbols-outlined text-lg block">close</span>
        </button>
      )}
    </form>
  );
};
