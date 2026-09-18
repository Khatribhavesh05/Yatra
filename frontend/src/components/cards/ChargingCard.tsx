import React from 'react';
import { Link } from 'react-router-dom';
import { ChargingCenter } from '../../types';
import { Badge } from '../common/Badge';
import { formatStationStatus } from '../../utils/formatters';

export interface ChargingCardProps {
  station: ChargingCenter;
  isSelected?: boolean;
  onSelect?: () => void;
  showMapAction?: boolean;
}

export const ChargingCard: React.FC<ChargingCardProps> = ({
  station,
  isSelected,
  onSelect,
  showMapAction = true,
}) => {
  const statusInfo = formatStationStatus(station.status);
  const connectors = station.connectors || {};
  const connectorEntries = Object.entries(connectors);

  return (
    <div
      onClick={onSelect}
      className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col ${
        isSelected
          ? 'border-primary bg-primary-container/5 shadow-md ring-1 ring-primary'
          : 'border-outline-variant/70 bg-white hover:border-primary/50 hover:shadow-sm'
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <h4 className="font-headline-sm text-base font-bold text-on-background line-clamp-1">
            {station.name}
          </h4>
          <p className="text-xs text-on-surface-variant line-clamp-1 mt-0.5">
            {station.address || `${station.city || 'Bikaner'}, ${station.state || 'Rajasthan'}`}
          </p>
        </div>

        {station.power_kw ? (
          <div className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-bold shrink-0">
            {station.power_kw} kW
          </div>
        ) : null}
      </div>

      <div className="flex items-center gap-2 my-2 flex-wrap">
        <Badge
          variant={station.status === 'operational' ? 'success' : 'warning'}
          size="sm"
          dot
        >
          {statusInfo.label}
        </Badge>
        {station.operating_hours && (
          <span className="text-[11px] text-on-surface-variant bg-surface-container px-2 py-0.5 rounded flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">schedule</span>
            {station.operating_hours}
          </span>
        )}
      </div>

      {/* Connectors Chips */}
      {connectorEntries.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {connectorEntries.map(([type, count]) => (
            <span
              key={type}
              className="text-[10px] font-label-bold bg-surface-container-low text-on-surface px-2 py-0.5 rounded border border-outline-variant/60 uppercase"
            >
              {type.replace(/_/g, ' ')}: {String(count)}
            </span>
          ))}
        </div>
      )}

      {/* Footer / Actions */}
      <div className="mt-4 pt-3 border-t border-outline-variant/40 flex items-center justify-between gap-2">
        <Link
          to={`/charging/${station.id}`}
          onClick={(e) => e.stopPropagation()}
          className="text-xs font-label-bold text-primary hover:underline flex items-center gap-1"
        >
          Full Details & Navigation
          <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </Link>

        {showMapAction && (
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${station.latitude},${station.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="p-1.5 rounded bg-surface-container hover:bg-primary hover:text-white text-on-surface transition-colors"
            title="Open in Google Maps Navigation"
          >
            <span className="material-symbols-outlined text-base">directions</span>
          </a>
        )}
      </div>
    </div>
  );
};
