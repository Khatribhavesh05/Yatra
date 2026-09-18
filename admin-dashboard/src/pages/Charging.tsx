import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Info, MapPin, Zap } from 'lucide-react';
import { getChargingCenters } from '../api/charging';
import { QUERY_KEYS } from '../utils/constants';

export default function Charging() {
  const { data: centers, isLoading, error } = useQuery({
    queryKey: [QUERY_KEYS.CHARGING_CENTERS],
    queryFn: getChargingCenters,
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-urja-text-secondary">Loading charging centers...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-urja-danger">Failed to load charging centers</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-urja-text">Charging Infrastructure</h1>
      </div>

      <div className="flex items-center gap-3 rounded-lg bg-urja-pale p-4 border border-urja-green-border/50 text-urja-text-secondary">
        <Info className="h-5 w-5 text-urja-success shrink-0" />
        <p>Showing publicly visible charging centers. Admin management API coming soon.</p>
      </div>

      {!centers || centers.length === 0 ? (
        <div className="rounded-2xl border border-urja-border bg-urja-surface/50 p-12 text-center">
          <p className="text-urja-text-secondary">No charging centers available.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {centers.map((center: any) => (
            <div key={center.id} className="rounded-2xl border border-urja-border bg-urja-surface p-6 flex flex-col gap-4">
              <div>
                <h3 className="text-lg font-semibold text-urja-text">{center.name}</h3>
              </div>
              
              <div className="flex items-start gap-2 text-urja-text-secondary">
                <MapPin className="h-4 w-4 mt-1 shrink-0" />
                <div className="text-sm">
                  <div>{center.location.lat.toFixed(4)}, {center.location.lng.toFixed(4)}</div>
                </div>
              </div>

              <div className="flex items-start gap-2 text-urja-text-secondary">
                <Zap className="h-4 w-4 mt-1 shrink-0" />
                <div className="text-sm flex flex-col gap-2 w-full">
                  <div className="text-urja-text-secondary font-medium">Power: {center.total_capacity_kw || 150} kW</div>
                  {center.supported_connectors && (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {Object.entries(center.supported_connectors).map(([type, count]) => (
                        <span key={type} className="inline-flex items-center px-2 py-1 rounded bg-urja-pale text-xs font-medium text-urja-text-secondary border border-urja-green-border">
                          {type} ×{count as number}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
