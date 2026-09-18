import React from 'react';

interface BatteryIndicatorProps {
  soc: number | null | undefined;
  isCharging?: boolean | null;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const BatteryIndicator: React.FC<BatteryIndicatorProps> = ({
  soc,
  isCharging = false,
  size = 'md',
  showLabel = true,
}) => {
  const value = soc == null || isNaN(soc) ? 0 : Math.max(0, Math.min(100, Math.round(soc)));

  let colorClass = 'bg-teal-600';
  let textClass = 'text-teal-700';

  if (value < 20) {
    colorClass = 'bg-rose-600';
    textClass = 'text-rose-700 font-bold';
  } else if (value <= 50) {
    colorClass = 'bg-amber-500';
    textClass = 'text-amber-700 font-semibold';
  }

  const heightClass = size === 'sm' ? 'h-1.5 w-12' : size === 'lg' ? 'h-3 w-24' : 'h-2 w-16';

  return (
    <div className="inline-flex items-center gap-2">
      <div className={`relative bg-slate-200 rounded-full overflow-hidden ${heightClass}`}>
        <div
          className={`h-full transition-all duration-500 rounded-full ${colorClass}`}
          style={{ width: `${value}%` }}
        />
      </div>

      {showLabel && (
        <span className={`text-xs font-mono font-bold ${textClass} flex items-center gap-0.5`}>
          {isCharging && (
            <span className="material-symbols-outlined text-sm text-blue-600 animate-pulse">
              bolt
            </span>
          )}
          {soc == null ? 'N/A' : `${value}%`}
        </span>
      )}
    </div>
  );
};

export default BatteryIndicator;
