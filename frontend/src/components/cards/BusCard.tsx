import React from 'react';
import { Link } from 'react-router-dom';
import { VehiclePublic } from '../../types';
import { Badge } from '../common/Badge';
import { formatRelativeTime } from '../../utils/formatters';

export interface BusCardProps {
  vehicle: VehiclePublic;
  isSelected?: boolean;
  onSelect?: () => void;
  showMapAction?: boolean;
}

export const BusCard: React.FC<BusCardProps> = ({
  vehicle,
  isSelected,
  onSelect,
  showMapAction = true,
}) => {
  const isLive = vehicle.status === 'online';

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
          <div className="w-10 h-10 rounded-lg bg-primary-container/10 text-primary flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-2xl">directions_bus</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-headline-sm text-base font-bold text-on-background">
                {vehicle.vehicle_code || 'E-Bus'}
              </span>
              <Badge variant={isLive ? 'success' : 'neutral'} size="sm" dot>
                {isLive ? 'LIVE' : 'IDLE'}
              </Badge>
            </div>
            <p className="text-xs text-on-surface-variant font-medium">
              {vehicle.route_name ? `${vehicle.route_code || ''} • ${vehicle.route_name}` : vehicle.department_name}
            </p>
          </div>
        </div>

        {vehicle.soc_pct !== undefined && vehicle.soc_pct !== null && (
          <div className="text-right">
            <div className="inline-flex items-center gap-1 text-xs font-bold text-primary bg-primary-container/10 px-2 py-0.5 rounded">
              <span className="material-symbols-outlined text-sm">battery_charging_full</span>
              {vehicle.soc_pct}%
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-outline-variant/40 flex items-center justify-between text-xs text-on-surface-variant">
        <div className="flex items-center gap-3">
          {vehicle.speed_kph !== undefined && vehicle.speed_kph !== null && (
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm text-outline">speed</span>
              <span className="font-semibold text-on-surface">{vehicle.speed_kph} km/h</span>
            </span>
          )}
          {vehicle.direction && (
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm text-outline">navigation</span>
              <span>{vehicle.direction}</span>
            </span>
          )}
        </div>
        <span className="text-[11px] text-outline">
          {formatRelativeTime(vehicle.last_updated_at)}
        </span>
      </div>

      {showMapAction && (
        <div className="mt-3 flex gap-2">
          {vehicle.route_id && (
            <Link
              to={`/routes/${vehicle.route_id}`}
              onClick={(e) => e.stopPropagation()}
              className="flex-1 text-center py-1.5 px-3 bg-surface-container hover:bg-surface-container-high rounded text-xs font-label-bold text-on-surface transition-colors"
            >
              Route Details
            </Link>
          )}
          <button
            onClick={onSelect}
            className="flex-1 py-1.5 px-3 bg-primary text-white hover:bg-on-primary-fixed-variant rounded text-xs font-label-bold transition-colors flex items-center justify-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">my_location</span>
            Track On Map
          </button>
        </div>
      )}
    </div>
  );
};
