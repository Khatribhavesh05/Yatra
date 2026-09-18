import React from 'react';

export type StatusType =
  | 'active'
  | 'charging'
  | 'idle'
  | 'offline'
  | 'critical'
  | 'warning'
  | 'info'
  | 'resolved'
  | 'healthy'
  | 'degraded'
  | 'down'
  | 'provisioned'
  | 'inactive';

interface StatusBadgeProps {
  status: StatusType | string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  size = 'md',
  showDot = true,
}) => {
  const normStatus = (status || '').toLowerCase();
  const displayLabel = label || status?.toUpperCase().replace('_', ' ') || 'UNKNOWN';

  let styleClasses = 'bg-slate-100 text-slate-700 border-slate-200';
  let dotColor = 'bg-slate-400';

  if (normStatus === 'active' || normStatus === 'healthy' || normStatus === 'resolved' || normStatus === 'connected') {
    styleClasses = 'bg-teal-50 text-teal-800 border-teal-200/80 font-semibold';
    dotColor = 'bg-teal-600';
  } else if (normStatus === 'charging') {
    styleClasses = 'bg-blue-50 text-blue-800 border-blue-200/80 font-semibold';
    dotColor = 'bg-blue-600';
  } else if (normStatus === 'idle' || normStatus === 'warning' || normStatus === 'degraded' || normStatus === 'provisioned') {
    styleClasses = 'bg-amber-50 text-amber-800 border-amber-200/80 font-semibold';
    dotColor = 'bg-amber-500';
  } else if (normStatus === 'critical' || normStatus === 'down' || normStatus === 'error' || normStatus === 'high') {
    styleClasses = 'bg-rose-50 text-rose-800 border-rose-200/80 font-semibold';
    dotColor = 'bg-rose-600';
  } else if (normStatus === 'offline' || normStatus === 'inactive' || normStatus === 'disconnected') {
    styleClasses = 'bg-slate-100 text-slate-600 border-slate-200 font-medium';
    dotColor = 'bg-slate-400';
  } else if (normStatus === 'info') {
    styleClasses = 'bg-indigo-50 text-indigo-700 border-indigo-200 font-medium';
    dotColor = 'bg-indigo-500';
  }

  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-[11px]'
      : size === 'lg'
      ? 'px-3 py-1.5 text-xs'
      : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 border rounded-md whitespace-nowrap tracking-wide uppercase ${sizeClasses} ${styleClasses}`}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />}
      {displayLabel}
    </span>
  );
};

export default StatusBadge;
