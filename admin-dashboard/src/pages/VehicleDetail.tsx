import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, Zap, Activity, Navigation2, Thermometer, AlertTriangle, Clock } from 'lucide-react';
import { getVehicle, getVehicleTrack } from '../api/vehicles';
import { getAlerts } from '../api/alerts';
import { getDepartments } from '../api/departments';
import { QUERY_KEYS } from '../utils/constants';
import { formatRelativeTime, formatDate, getVehicleStatus } from '../utils/formatters';
import { VehicleTypeLabels } from '../types/enums';
import { VehicleWithTelemetryResponse, VehicleTrackPoint, AlertResponse, DepartmentResponse } from '../types/api';
import VehicleTrackMap from '../components/maps/VehicleTrackMap';

export default function VehicleDetail() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<'telemetry' | 'history' | 'alerts'>('telemetry');

  const { data: vehicle, isLoading: isLoadingVehicle } = useQuery({
    queryKey: [QUERY_KEYS.VEHICLES, id],
    queryFn: () => getVehicle(id!),
    enabled: !!id
  });

  const { data: trackData } = useQuery({
    queryKey: [QUERY_KEYS.VEHICLES, id, 'track'],
    queryFn: () => getVehicleTrack(id!, 100),
    enabled: !!id && activeTab === 'history'
  });

  const { data: alertsData } = useQuery({
    queryKey: [QUERY_KEYS.ALERTS, 'vehicle', id],
    queryFn: () => getAlerts('all', 100, 0),
    enabled: !!id && activeTab === 'alerts'
  });

  const { data: deptsData } = useQuery({
    queryKey: QUERY_KEYS.DEPARTMENTS,
    queryFn: () => getDepartments(200, 0)
  });

  const trackPoints = trackData ?? [];
  const vehicleAlerts = (alertsData ?? []).filter((a: AlertResponse) => a.vehicle_id === id);
  const deptName = (deptsData ?? []).find((d: DepartmentResponse) => d.id === vehicle?.department_id)?.name || 'Unknown Department';

  if (isLoadingVehicle) {
    return <div className="p-6 text-urja-text-secondary">Loading vehicle details...</div>;
  }

  if (!vehicle) {
    return <div className="p-6 text-urja-danger">Vehicle not found.</div>;
  }

  const status = 
    vehicle.connectivity_status === 'offline' || !vehicle.connectivity_status ? 'offline' :
    vehicle.charging ? 'charging' :
    (vehicle.speed_kph && vehicle.speed_kph > 0) ? 'active' : 'idle';

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-urja-text-secondary">
        <Link to="/vehicles" className="hover:text-urja-primary transition-colors">Vehicles</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-urja-text">{vehicle.vehicle_code}</span>
      </div>

      {/* Top Card */}
      <div className="bg-urja-surface border border-urja-border rounded-2xl shadow-sm hover:shadow hover:border-urja-green-border hover:-translate-y-1 transition-all duration-200 p-6 lg:p-8 flex flex-col lg:flex-row gap-8 lg:items-center">
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-urja-text">{vehicle.vehicle_code}</h1>
            <span className={`px-3 py-1 rounded-full text-xs uppercase font-bold border ${
              status === 'active' ? 'bg-urja-success/10 text-urja-primary border-urja-success/20' :
              status === 'charging' ? 'bg-urja-info/10 text-blue-400 border-urja-info/20' :
              status === 'offline' ? 'bg-urja-border/50 text-urja-text-secondary border-urja-border' :
              'bg-yellow-500/10 text-urja-warning border-yellow-500/20'
            }`}>
              {status}
            </span>
          </div>
          <div className="text-urja-text-secondary">
            {VehicleTypeLabels[vehicle.vehicle_type as keyof typeof VehicleTypeLabels] || vehicle.vehicle_type}
          </div>
          <div className="text-sm font-medium text-urja-text-secondary bg-urja-bg px-3 py-1.5 rounded-lg inline-block border border-urja-border">
            {deptName}
          </div>
        </div>

        <div className="flex flex-col lg:items-end gap-2 lg:min-w-[300px]">
          <div className="flex items-center gap-4 w-full lg:justify-end">
            <div className="text-right">
              <div className="text-sm text-urja-text-secondary mb-1">Battery Level</div>
              <div className="text-3xl font-bold text-urja-text">{vehicle.soc_pct ?? '--'}%</div>
            </div>
            <div className="w-16 h-16 rounded-full border-4 border-urja-border flex items-center justify-center relative">
              <Zap className={`w-8 h-8 ${vehicle.charging ? 'text-blue-400 animate-pulse' : vehicle.soc_pct && vehicle.soc_pct > 20 ? 'text-urja-primary' : 'text-urja-danger'}`} />
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-800" />
                <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray={`${(vehicle.soc_pct || 0) * 2.89} 289`} className={`${vehicle.charging ? 'text-urja-info' : (vehicle.soc_pct || 0) > 20 ? 'text-urja-success' : 'text-urja-danger'}`} />
              </svg>
            </div>
          </div>
          <div className="text-xs text-urja-text-muted flex items-center gap-2 mt-2">
            <Clock className="w-3 h-3" /> Last updated: {vehicle.last_seen ? formatRelativeTime(vehicle.last_seen) : 'Never'}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-urja-border flex gap-6">
        {[
          { id: 'telemetry', label: 'Live Telemetry' },
          { id: 'history', label: 'Track History' },
          { id: 'alerts', label: 'Alerts' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === tab.id 
                ? 'border-urja-primary text-urja-primary' 
                : 'border-transparent text-urja-text-secondary hover:text-urja-text'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'telemetry' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-urja-surface border border-urja-border rounded-2xl shadow-sm hover:shadow hover:border-urja-green-border hover:-translate-y-1 transition-all duration-200 p-5">
              <div className="flex items-center gap-2 text-urja-text-secondary mb-3"><Activity className="w-4 h-4" /> Speed</div>
              <div className="text-2xl font-semibold text-urja-text">{vehicle.speed_kph ? Math.round(vehicle.speed_kph) : 0} <span className="text-sm font-normal text-urja-text-muted">km/h</span></div>
            </div>
            <div className="bg-urja-surface border border-urja-border rounded-2xl shadow-sm hover:shadow hover:border-urja-green-border hover:-translate-y-1 transition-all duration-200 p-5">
              <div className="flex items-center gap-2 text-urja-text-secondary mb-3"><Navigation2 className="w-4 h-4" /> Est. Range</div>
              <div className="text-2xl font-semibold text-urja-text">{vehicle.estimated_range_km ? `${Math.round(vehicle.estimated_range_km)} km` : '--'}</div>
            </div>
            <div className="bg-urja-surface border border-urja-border rounded-2xl shadow-sm hover:shadow hover:border-urja-green-border hover:-translate-y-1 transition-all duration-200 p-5">
              <div className="flex items-center gap-2 text-urja-text-secondary mb-3"><Navigation2 className="w-4 h-4" /> Location</div>
              <div className="text-sm font-mono text-urja-text-secondary mb-1">Lat: {vehicle.latitude?.toFixed(5) || '--'}</div>
              <div className="text-sm font-mono text-urja-text-secondary">Lng: {vehicle.longitude?.toFixed(5) || '--'}</div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-urja-surface border border-urja-border rounded-2xl shadow-sm hover:shadow hover:border-urja-green-border hover:-translate-y-1 transition-all duration-200 overflow-hidden flex flex-col h-[500px]">
            <div className="h-64 border-b border-urja-border relative">
              <VehicleTrackMap 
                trackPoints={trackPoints} 
                currentLat={vehicle.latitude ?? undefined} 
                currentLng={vehicle.longitude ?? undefined} 
              />
            </div>
            <div className="flex-1 overflow-auto">
              <table className="w-full text-left text-sm text-urja-text-secondary">
                <thead className="bg-urja-bg/80 sticky top-0 text-xs uppercase font-semibold text-urja-text-muted border-b border-urja-border">
                  <tr>
                    <th className="px-6 py-3">Time</th>
                    <th className="px-6 py-3">Speed</th>
                    <th className="px-6 py-3">SoC</th>
                    <th className="px-6 py-3">Location</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-urja-border">
                  {trackPoints.map((point: VehicleTrackPoint) => (
                    <tr key={point.observed_at} className="hover:bg-urja-pale/30">
                      <td className="px-6 py-3">{formatDate(point.observed_at)}</td>
                      <td className="px-6 py-3">{point.speed_kph ? Math.round(point.speed_kph) : 0} km/h</td>
                      <td className="px-6 py-3">{point.soc_pct}%</td>
                      <td className="px-6 py-3 font-mono text-xs">{point.latitude.toFixed(4)}, {point.longitude.toFixed(4)}</td>
                    </tr>
                  ))}
                  {trackPoints.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-urja-text-muted">No track data available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className="space-y-3">
            {vehicleAlerts.map((alert: AlertResponse) => (
              <div key={alert.id} className="bg-urja-surface border border-urja-border rounded-2xl shadow-sm hover:shadow hover:border-urja-green-border hover:-translate-y-1 transition-all duration-200 p-4 flex gap-4">
                <div className={`mt-1 p-2 rounded-lg shrink-0 ${
                  alert.severity === 'critical' ? 'bg-urja-danger/10 text-urja-danger' :
                  alert.severity === 'high' ? 'bg-orange-500/10 text-orange-500' :
                  'bg-yellow-500/10 text-yellow-500'
                }`}>
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-urja-text">{alert.alert_type}</span>
                    <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-sm ${
                      alert.status === 'active' ? 'bg-slate-700 text-urja-text-secondary' : 'bg-urja-pale text-urja-text-muted'
                    }`}>
                      {alert.status}
                    </span>
                  </div>
                  <p className="text-sm text-urja-text-secondary">Severity: {alert.severity}{alert.resolution_note ? ` — ${alert.resolution_note}` : ''}</p>
                  <div className="text-xs text-urja-text-muted mt-2">
                    {formatDate(alert.created_at)}
                  </div>
                </div>
              </div>
            ))}
            {vehicleAlerts.length === 0 && (
              <div className="bg-urja-surface border border-urja-border rounded-2xl shadow-sm hover:shadow hover:border-urja-green-border hover:-translate-y-1 transition-all duration-200 p-12 flex flex-col items-center justify-center text-urja-text-muted">
                <AlertTriangle className="w-12 h-12 mb-4 opacity-20" />
                <p>No alerts found for this vehicle.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
