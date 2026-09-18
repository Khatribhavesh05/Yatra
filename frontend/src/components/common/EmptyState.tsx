import React, { ReactNode } from 'react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  children?: ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'search_off',
  title,
  description,
  actionLabel,
  onAction,
  children,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-surface-container-lowest border border-outline-variant/60 rounded-xl max-w-lg mx-auto">
      <div className="w-16 h-16 rounded-full bg-secondary-container text-secondary flex items-center justify-center mb-4">
        <span className="material-symbols-outlined text-3xl">{icon}</span>
      </div>
      <h4 className="font-headline-sm text-lg text-on-background font-bold mb-2">{title}</h4>
      <p className="font-body-md text-sm text-on-surface-variant max-w-sm mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
      {children}
    </div>
  );
};
