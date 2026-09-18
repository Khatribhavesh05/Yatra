import React from 'react';
import { Link } from 'react-router-dom';
import { Stop } from '../../types';

export interface StopCardProps {
  stop: Stop;
  isSelected?: boolean;
  onSelect?: () => void;
  sequence?: number;
}

export const StopCard: React.FC<StopCardProps> = ({ stop, isSelected, onSelect, sequence }) => {
  return (
    <div
      onClick={onSelect}
      className={`p-3.5 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 ${
        isSelected
          ? 'border-primary bg-primary-container/5 shadow-md ring-1 ring-primary'
          : 'border-outline-variant/70 bg-white hover:border-primary/50 hover:shadow-sm'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center font-bold text-xs text-primary border border-outline-variant">
          {sequence !== undefined ? sequence : <span className="material-symbols-outlined text-base">pin_drop</span>}
        </div>
        <div>
          <h4 className="font-headline-sm text-sm font-bold text-on-background">{stop.name}</h4>
          <p className="text-[11px] text-on-surface-variant line-clamp-1">{stop.address || `${stop.city}, ${stop.state}`}</p>
        </div>
      </div>

      <Link
        to={`/stops/${stop.id}`}
        onClick={(e) => e.stopPropagation()}
        className="p-1.5 rounded-full hover:bg-surface-container text-primary transition-colors"
        title="View Stop Info & Passing Buses"
      >
        <span className="material-symbols-outlined text-lg">info</span>
      </Link>
    </div>
  );
};
