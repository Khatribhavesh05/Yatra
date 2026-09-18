import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getChargingCenters } from '../api/charging';
import { getVehicles } from '../api/vehicles';
import { getDepartments } from '../api/departments';
import { QUERY_KEYS } from '../utils/constants';
import { VehicleWithTelemetryResponse, DepartmentResponse } from '../types/api';
import { formatRange } from '../utils/formatters';
import PageHeader from '../components/common/PageHeader';
import StatusBadge from '../components/common/StatusBadge';
import BatteryIndicator from '../components/common/BatteryIndicator';
import { EmptyState, ErrorState } from '../components/common/FeedbackStates';

export default function Charging() {
  const { data: centers, isLoading: isLoadingCenters, error: errorCenters, refetch: refetchCenters } = useQuery({
    queryKey: [QUERY_KEYS.CHARGING_CENTERS],
    queryFn: getChargingCenters,
  });

  const { data: vehiclesData, isLoading: isLoadingVehicles } = useQuery({
    queryKey: QUERY_KEYS.VEHICLES,
    queryFn: () => getVehicles(500, 0),
  });

  const { data: deptsData } = useQuery({
    queryKey: QUERY_KEYS.DEPARTMENTS,
    queryFn: () => getDepartments(200, 0),
  });

  const vehicles = vehiclesData ?? [];
  const departments = deptsData ?? [];
  const chargingVehicles = vehicles.filter((v: VehicleWithTelemetryResponse) => v.charging);

  const isLoading = isLoadingCenters || isLoadingVehicles;

  if (errorCenters) {
    return (
      <ErrorState
        title="Failed to Load Charging Operations"
        message="Could not load charging station infrastructure or live charging session status."
        onRetry={refetchCenters}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Charging Infrastructure & Operations Center"
        subtitle="Real-time monitoring of active EV charging sessions and public station infrastructure."
        badgeText="CHARGING CONTROL"
      />

      {/* Section 1: Active Charging Sessions */}
      <div className="yatra-card p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Active Vehicle Charging Sessions
            </h3>
            <p className="text-xs text-slate-500">EVs currently connected and drawing power across stations</p>
          </div>
          <StatusBadge status="charging" label={`${chargingVehicles.length} Charging Active`} />
        </div>

        {chargingVehicles.length === 0 ? (
          <EmptyState
            title="No Active Charging Sessions"
            description="No fleet vehicles are actively connected to chargers at this time."
            icon="ev_station"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {chargingVehicles.map((vehicle: VehicleWithTelemetryResponse) => {
              const dept = departments.find((d: DepartmentResponse) => d.id === vehicle.department_id);
              return (
                <div
                  key={vehicle.id}
                  className="p-4 bg-slate-50 border border-blue-200 rounded-xl space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900">{vehicle.vehicle_code}</h4>
                      <p className="text-xs text-slate-500">{dept?.name || 'Department'}</p>
                    </div>
                    <StatusBadge status="charging" size="sm" />
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-200/80">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-semibold">State of Charge</span>
                      <span className="font-mono font-bold text-blue-700">{vehicle.soc_pct ?? 0}%</span>
                    </div>
                    <BatteryIndicator soc={vehicle.soc_pct} isCharging={true} size="md" />

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                      <span>Est. Range: {formatRange(vehicle.estimated_range_km)}</span>
                      <span className="font-semibold uppercase">{vehicle.vehicle_type}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Section 2: Charging Station Infrastructure Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              State Charging Center Infrastructure Network
            </h3>
            <p className="text-xs text-slate-500">Public and depot charging locations supporting Rajasthan EV fleet</p>
          </div>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-xs font-semibold text-slate-500">
            Loading charging station telemetry...
          </div>
        ) : !centers || centers.length === 0 ? (
          <EmptyState
            title="No Charging Stations Configured"
            description="No charging stations recorded in the central infrastructure directory."
            icon="electrical_services"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {centers.map((center: any) => {
              const lat = center.latitude ?? center.location?.lat ?? 0;
              const lng = center.longitude ?? center.location?.lng ?? 0;
              const power = center.power_kw ?? center.total_capacity_kw ?? 150;
              const connectors = center.connectors ?? center.supported_connectors ?? {};

              return (
                <div key={center.id} className="yatra-card p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{center.name}</h4>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">
                        {lat.toFixed(4)}, {lng.toFixed(4)}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                      OPERATIONAL
                    </span>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-semibold">Capacity Rating</span>
                    <span className="font-extrabold text-slate-900 font-mono">{power} kW</span>
                  </div>

                  {connectors && Object.keys(connectors).length > 0 && (
                    <div className="pt-2 flex flex-wrap gap-1.5">
                      {Object.entries(connectors).map(([type, count]) => (
                        <span
                          key={type}
                          className="px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded text-[11px] font-semibold"
                        >
                          {type.toUpperCase()}: {count as number} guns
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
