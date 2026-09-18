import React from 'react';
import { Link } from 'react-router-dom';
import { Route } from '../../types';

export interface RouteCardProps {
  route: Route;
  isSelected?: boolean;
  onSelect?: () => void;
}

export const RouteCard: React.FC<RouteCardProps> = ({ route, isSelected, onSelect }) => {
  const stopCount = route.stops?.length || 0;

  return (
    <div
      onClick={onSelect}
      className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
        isSelected
          ? 'border-primary bg-primary-container/5 shadow-md ring-1 ring-primary'
          : 'border-outline-variant/70 bg-white hover:border-primary/50 hover:shadow-sm'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white shadow-sm"
            style={{ backgroundColor: route.color || '#006A3B' }}
          >
            <span className="text-xs tracking-wider">{route.code || 'RT'}</span>
          </div>
          <div>
            <h4 className="font-headline-sm text-base font-bold text-on-background">
              {route.name}
            </h4>
            <p className="text-xs text-on-surface-variant font-medium">
              {route.city}, {route.state}
            </p>
          </div>
        </div>

        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-surface-container text-on-surface-variant">
          {stopCount} {stopCount === 1 ? 'Stop' : 'Stops'}
        </span>
      </div>

      {route.description && (
        <p className="mt-2 text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
          {route.description}
        </p>
      )}

      <div className="mt-3 pt-3 border-t border-outline-variant/40 flex items-center justify-between">
        <Link
          to={`/routes/${route.id}`}
          onClick={(e) => e.stopPropagation()}
          className="text-xs font-label-bold text-primary hover:underline flex items-center gap-1"
        >
          View Full Route & Stops
          <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </Link>
      </div>
    </div>
  );
};
