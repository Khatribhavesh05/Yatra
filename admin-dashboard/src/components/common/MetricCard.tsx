import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
  trend?: {
    text: string;
    type?: 'positive' | 'negative' | 'neutral';
  };
  accentColor?: 'teal' | 'amber' | 'rose' | 'blue' | 'slate';
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  accentColor = 'teal',
  onClick,
}) => {
  let badgeColor = 'bg-teal-50 text-teal-700 border-teal-200';
  let iconBg = 'bg-teal-500/10 text-teal-700';

  if (accentColor === 'amber') {
    badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
    iconBg = 'bg-amber-500/10 text-amber-700';
  } else if (accentColor === 'rose') {
    badgeColor = 'bg-rose-50 text-rose-700 border-rose-200';
    iconBg = 'bg-rose-500/10 text-rose-700';
  } else if (accentColor === 'blue') {
    badgeColor = 'bg-blue-50 text-blue-700 border-blue-200';
    iconBg = 'bg-blue-500/10 text-blue-700';
  } else if (accentColor === 'slate') {
    badgeColor = 'bg-slate-50 text-slate-700 border-slate-200';
    iconBg = 'bg-slate-500/10 text-slate-700';
  }

  return (
    <div
      onClick={onClick}
      className={`yatra-card p-4 transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:border-teal-400 hover:shadow-md' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{title}</span>
          <div className="mt-1 text-2xl font-extrabold text-slate-900 tracking-tight">{value}</div>
        </div>
        {icon && (
          <div className={`p-2.5 rounded-xl border border-slate-100 ${iconBg}`}>
            <span className="material-symbols-outlined text-xl">{icon}</span>
          </div>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
          {subtitle && <span className="text-slate-500 font-medium">{subtitle}</span>}
          {trend && (
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${badgeColor}`}
            >
              {trend.text}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default MetricCard;
