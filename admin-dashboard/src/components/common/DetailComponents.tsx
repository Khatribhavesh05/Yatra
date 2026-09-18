import React from 'react';

interface InfoRowProps {
  label: string;
  value: React.ReactNode;
  icon?: string;
  border?: boolean;
}

export const InfoRow: React.FC<InfoRowProps> = ({
  label,
  value,
  icon,
  border = true,
}) => {
  return (
    <div
      className={`flex items-center justify-between py-2.5 text-xs ${
        border ? 'border-b border-slate-100' : ''
      }`}
    >
      <div className="flex items-center gap-2 text-slate-500 font-medium">
        {icon && <span className="material-symbols-outlined text-base text-slate-400">{icon}</span>}
        <span>{label}</span>
      </div>
      <div className="font-semibold text-slate-900 text-right">{value ?? 'N/A'}</div>
    </div>
  );
};

interface DetailPanelProps {
  title: string;
  subtitle?: string;
  icon?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export const DetailPanel: React.FC<DetailPanelProps> = ({
  title,
  subtitle,
  icon,
  children,
  actions,
  className = '',
}) => {
  return (
    <div className={`yatra-card p-5 ${className}`}>
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
        <div className="flex items-center gap-2.5">
          {icon && (
            <div className="p-2 bg-teal-50 text-teal-700 rounded-lg">
              <span className="material-symbols-outlined text-lg">{icon}</span>
            </div>
          )}
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">{title}</h3>
            {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
          </div>
        </div>
        {actions && <div>{actions}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
};
