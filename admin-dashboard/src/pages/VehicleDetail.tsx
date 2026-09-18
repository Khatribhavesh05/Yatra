import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getVehicle, getVehicleTrack } from '../api/vehicles';
import { getAlerts } from '../api/alerts';
import { getDepartments } from '../api/departments';
import { QUERY_KEYS } from '../utils/constants';
import { formatRelativeTime, formatDate, getVehicleStatus } from '../utils/formatters';
import { VehicleTypeLabels } from '../types/enums';
import { VehicleTrackPoint, AlertResponse, DepartmentResponse } from '../types/api';
import VehicleTrackMap from '../components/maps/VehicleTrackMap';
import PageHeader from '../components/common/PageHeader';
import StatusBadge from '../components/common/StatusBadge';
import BatteryIndicator from '../components/common/BatteryIndicator';
import { DetailPanel, InfoRow } from '../components/common/DetailComponents';
import { EmptyState, ErrorState } from '../components/common/FeedbackStates';

export default function VehicleDetail() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<'telemetry' | 'history' | 'alerts'>('telemetry');

  const { data: vehicle, isLoading: isLoadingVehicle, isError } = useQuery({
    queryKey: [QUERY_KEYS.VEHICLES, id],
    queryFn: () => getVehicle(id!),
    enabled: !!id,
  });

  const { data: trackData } = useQuery({
    queryKey: [QUERY_KEYS.VEHICLES, id, 'track'],
    queryFn: () => getVehicleTrack(id!, 100),
    enabled: !!id && activeTab === 'history',
  });

  const { data: alertsData } = useQuery({
    queryKey: [QUERY_KEYS.ALERTS, 'vehicle', id],
    queryFn: () => getAlerts('all', 100, 0),
    enabled: !!id && activeTab === 'alerts',
  });

  const { data: deptsData } = useQuery({
    queryKey: QUERY_KEYS.DEPARTMENTS,
    queryFn: () => getDepartments(200, 0),
  });

  const trackPoints = trackData ?? [];
  const vehicleAlerts = (alertsData ?? []).filter((a: AlertResponse) => a.vehicle_id === id);
  const deptName = (deptsData ?? []).find((d: DepartmentResponse) => d.id === vehicle?.department_id)?.name || 'Unassigned Department';

  if (isLoadingVehicle) {
    return (
      <div className="py-12 flex justify-center text-xs font-semibold text-slate-500">
        Loading operational vehicle dossier...
      </div>
    );
  }

  if (isError || !vehicle) {
    return (
      <ErrorState
        title="Vehicle Dossier Unavailable"
        message="Could not locate vehicle record or telemetry history for the specified ID."
      />
    );
  }

  const st = getVehicleStatus(vehicle);
  const typeLabel = VehicleTypeLabels[vehicle.vehicle_type as keyof typeof VehicleTypeLabels] || vehicle.vehicle_type;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title={`Vehicle Dossier: ${vehicle.vehicle_code}`}
        subtitle={`Official EV Record • ${typeLabel} • ${deptName}`}
        badgeText={st.toUpperCase()}
        actions={
          <Link to="/vehicles" className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back to Registry
          </Link>
        }
      />

      {/* Primary Dossier Header Card */}
      <div className="yatra-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{vehicle.vehicle_code}</h1>
            <StatusBadge status={st} size="lg" />
          </div>
          <div className="text-xs text-slate-500 font-medium">
            Category: <span className="text-slate-800 font-bold">{typeLabel}</span> • Department: <span className="text-slate-800 font-bold">{deptName}</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            Vehicle ID: {vehicle.id}
          </div>
        </div>

        <div className="flex items-center gap-6 p-4 bg-slate-50 rounded-xl border border-slate-200 shrink-0">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase">State of Charge</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-0.5">
              {vehicle.soc_pct ?? 0}%
            </div>
            <div className="mt-1">
              <BatteryIndicator soc={vehicle.soc_pct} isCharging={vehicle.charging} size="md" />
            </div>
          </div>

          <div className="h-10 w-px bg-slate-200" />

          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase">Speed & Range</div>
            <div className="text-sm font-bold text-slate-900 mt-1">
              {vehicle.speed_kph ? `${Math.round(vehicle.speed_kph)} km/h` : '0 km/h'}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              Est: {vehicle.estimated_range_km ? `${Math.round(vehicle.estimated_range_km)} km` : 'N/A'}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        {[
          { id: 'telemetry', label: 'Live Telemetry' },
          { id: 'history', label: 'Track & Route History' },
          { id: 'alerts', label: `Alert History (${vehicleAlerts.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
              activeTab === tab.id
                ? 'border-teal-600 text-teal-700 bg-teal-50/40'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      {activeTab === 'telemetry' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DetailPanel title="Current Operational Status" icon="speed">
            <InfoRow label="Operational Status" value={<StatusBadge status={st} />} />
            <InfoRow label="Speed" value={vehicle.speed_kph ? `${Math.round(vehicle.speed_kph)} km/h` : '0 km/h'} />
            <InfoRow label="Estimated Battery Range" value={vehicle.estimated_range_km ? `${Math.round(vehicle.estimated_range_km)} km` : 'N/A'} />
            <InfoRow label="Charging State" value={vehicle.charging ? 'Charging Active' : 'Not Charging'} />
            <InfoRow label="Connectivity Status" value={vehicle.connectivity_status || 'Online'} border={false} />
          </DetailPanel>

          <DetailPanel title="Location & Hardware Info" icon="pin_drop">
            <InfoRow label="Latitude" value={vehicle.latitude?.toFixed(5) || 'N/A'} />
            <InfoRow label="Longitude" value={vehicle.longitude?.toFixed(5) || 'N/A'} />
            <InfoRow label="Heading" value={vehicle.heading_deg ? `${vehicle.heading_deg}°` : 'N/A'} />
            <InfoRow label="Department" value={deptName} />
            <InfoRow label="Last Telemetry Observed" value={vehicle.last_seen ? formatRelativeTime(vehicle.last_seen) : 'N/A'} border={false} />
          </DetailPanel>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="yatra-card p-5 space-y-4">
          <div className="h-80 rounded-xl overflow-hidden border border-slate-200 relative">
            <VehicleTrackMap
              trackPoints={trackPoints}
              currentLat={vehicle.latitude ?? undefined}
              currentLng={vehicle.longitude ?? undefined}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200">
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3 text-right">Speed</th>
                  <th className="py-2.5 px-3 text-right">SOC</th>
                  <th className="py-2.5 px-3 text-right">Coordinates</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-800">
                {trackPoints.map((pt: VehicleTrackPoint, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3">{formatDate(pt.observed_at)}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold">
                      {pt.speed_kph ? `${Math.round(pt.speed_kph)} km/h` : '0 km/h'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-teal-700">
                      {pt.soc_pct}%
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-500">
                      {pt.latitude.toFixed(4)}, {pt.longitude.toFixed(4)}
                    </td>
                  </tr>
                ))}
                {trackPoints.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-400">
                      No recent track points logged for this vehicle.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'alerts' && (
        <div className="space-y-3">
          {vehicleAlerts.length > 0 ? (
            vehicleAlerts.map((alert: AlertResponse) => (
              <div key={alert.id} className="yatra-card p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <StatusBadge status={alert.severity} size="sm" />
                    <h4 className="text-xs font-bold text-slate-900">{alert.alert_type}</h4>
                  </div>
                  <p className="text-xs text-slate-600">{alert.resolution_note || alert.alert_type}</p>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Triggered {formatRelativeTime(alert.created_at)}
                  </span>
                </div>
                <StatusBadge status={alert.status} size="sm" />
              </div>
            ))
          ) : (
            <EmptyState
              title="No Incidents Reported"
              description="No active or historical alerts recorded for this vehicle."
              icon="verified"
            />
          )}
        </div>
      )}
    </div>
  );
}
