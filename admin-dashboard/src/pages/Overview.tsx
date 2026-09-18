import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Car, Zap, AlertTriangle, Building2, WifiOff, Activity, Battery } from 'lucide-react';
import { getVehicles } from '../api/vehicles';
import { getAlerts } from '../api/alerts';
import { getDepartments } from '../api/departments';
import { QUERY_KEYS } from '../utils/constants';
import { VehicleWithTelemetryResponse, AlertResponse, DepartmentResponse } from '../types/api';
import { formatRelativeTime } from '../utils/formatters';
import { useAuth } from '../hooks/useAuth';
import { isPlatformAdmin } from '../utils/permissions';

export default function Overview() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user ? isPlatformAdmin(user.role) : false;

  const { data: vehiclesData, isLoading: isLoadingVehicles } = useQuery({
    queryKey: QUERY_KEYS.VEHICLES,
    queryFn: () => getVehicles(500, 0)
  });

  const { data: alertsData, isLoading: isLoadingAlerts } = useQuery({
    queryKey: QUERY_KEYS.ALERTS,
    queryFn: () => getAlerts('active', 200, 0)
  });

  // Only fetch departments for platform_admin
  const { data: deptsData, isLoading: isLoadingDepts } = useQuery({
    queryKey: QUERY_KEYS.DEPARTMENTS,
    queryFn: () => getDepartments(200, 0),
    enabled: isAdmin
  });

  const vehicles = vehiclesData ?? [];
  const alerts = alertsData ?? [];
  const departments = deptsData ?? [];

  // Calculate KPIs
  const totalEVs = vehicles.length;
  const activeEVs = vehicles.filter((v: VehicleWithTelemetryResponse) => (v.speed_kph && v.speed_kph > 0) || (v.connectivity_status === 'online' && !v.charging)).length;
  const chargingEVs = vehicles.filter((v: VehicleWithTelemetryResponse) => v.charging).length;
  const offlineEVs = vehicles.filter((v: VehicleWithTelemetryResponse) => v.connectivity_status === 'offline' || !v.connectivity_status).length;
  const criticalAlertsCount = alerts.filter((a: AlertResponse) => a.severity === 'critical' && a.status === 'active').length;

  // Calculate average battery for department view
  const vehiclesWithSoc = vehicles.filter((v: VehicleWithTelemetryResponse) => v.soc_pct != null);
  const avgBattery = vehiclesWithSoc.length > 0
    ? Math.round(vehiclesWithSoc.reduce((sum, v) => sum + (v.soc_pct || 0), 0) / vehiclesWithSoc.length)
    : 0;

  // KPI cards — different sets for admin vs department
  const kpis = isAdmin
    ? [
        { label: 'Total EVs', value: totalEVs, icon: Car, color: 'text-urja-text-secondary', bg: 'bg-urja-border/30', border: 'border-urja-border' },
        { label: 'Active', value: activeEVs, icon: Activity, color: 'text-urja-success', bg: 'bg-urja-success/10', border: 'border-urja-success/20' },
        { label: 'Charging', value: chargingEVs, icon: Zap, color: 'text-urja-info', bg: 'bg-urja-info/10', border: 'border-urja-info/20' },
        { label: 'Offline', value: offlineEVs, icon: WifiOff, color: 'text-urja-text-muted', bg: 'bg-urja-border/50', border: 'border-urja-border' },
        { label: 'Critical Alerts', value: criticalAlertsCount, icon: AlertTriangle, color: 'text-urja-danger', bg: 'bg-urja-danger/10', border: 'border-urja-danger/20' },
        { label: 'Departments', value: departments.length, icon: Building2, color: 'text-urja-dark', bg: 'bg-urja-dark/10', border: 'border-urja-dark/20' },
      ]
    : [
        { label: 'Fleet Vehicles', value: totalEVs, icon: Car, color: 'text-urja-text-secondary', bg: 'bg-urja-border/30', border: 'border-urja-border' },
        { label: 'Active', value: activeEVs, icon: Activity, color: 'text-urja-success', bg: 'bg-urja-success/10', border: 'border-urja-success/20' },
        { label: 'Charging', value: chargingEVs, icon: Zap, color: 'text-urja-info', bg: 'bg-urja-info/10', border: 'border-urja-info/20' },
        { label: 'Offline', value: offlineEVs, icon: WifiOff, color: 'text-urja-text-muted', bg: 'bg-urja-border/50', border: 'border-urja-border' },
        { label: 'Critical Alerts', value: criticalAlertsCount, icon: AlertTriangle, color: 'text-urja-danger', bg: 'bg-urja-danger/10', border: 'border-urja-danger/20' },
        { label: 'Avg Battery', value: `${avgBattery}%`, icon: Battery, color: 'text-urja-info', bg: 'bg-urja-info/10', border: 'border-urja-info/20' },
      ];

  // Department Stats (admin only)
  const deptStats = departments.map((dept: DepartmentResponse) => {
    const deptVehicles = vehicles.filter((v: VehicleWithTelemetryResponse) => v.department_id === dept.id);
    return {
      ...dept,
      total: deptVehicles.length,
      active: deptVehicles.filter((v: VehicleWithTelemetryResponse) => (v.speed_kph && v.speed_kph > 0) || (v.connectivity_status === 'online' && !v.charging)).length,
      charging: deptVehicles.filter((v: VehicleWithTelemetryResponse) => v.charging).length,
      offline: deptVehicles.filter((v: VehicleWithTelemetryResponse) => v.connectivity_status === 'offline' || !v.connectivity_status).length,
      alerts: alerts.filter((a: AlertResponse) => a.status === 'active' && deptVehicles.some((v: VehicleWithTelemetryResponse) => v.id === a.vehicle_id)).length
    };
  }).sort((a, b) => b.total - a.total);

  const criticalAlerts = alerts
    .filter((a: AlertResponse) => a.severity === 'critical' || a.severity === 'high')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 8);

  const isLoading = isLoadingVehicles || isLoadingAlerts || (isAdmin && isLoadingDepts);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-urja-text">
          {isAdmin ? 'Platform Overview' : `${user?.department_name || 'Department'} Overview`}
        </h1>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-urja-surface border border-urja-border rounded-2xl shadow-sm hover:shadow hover:border-urja-green-border hover:-translate-y-1 transition-all duration-200 p-4 h-24 animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-urja-text">
        {isAdmin ? 'Platform Overview' : `${user?.department_name || 'Department'} — Fleet Overview`}
      </h1>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <div key={i} className="bg-urja-surface border border-urja-border rounded-2xl shadow-sm hover:shadow hover:border-urja-green-border hover:-translate-y-1 transition-all duration-200 p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg ${kpi.bg} ${kpi.border} border`}>
                  <Icon className={`w-5 h-5 ${kpi.color}`} />
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-urja-text">{kpi.value}</div>
                <div className="text-xs text-urja-text-secondary font-medium uppercase tracking-wider">{kpi.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left panel: Department table (admin) OR Vehicle summary (department) */}
        <div className="lg:col-span-3 bg-urja-surface border border-urja-border rounded-2xl shadow-sm hover:shadow hover:border-urja-green-border hover:-translate-y-1 transition-all duration-200 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-urja-border">
            <h2 className="text-lg font-semibold text-urja-text">
              {isAdmin ? 'Department Summary' : 'Fleet Status'}
            </h2>
          </div>
          <div className="overflow-x-auto flex-1">
            {isAdmin ? (
              /* Admin: Department table */
              <table className="w-full text-left text-sm text-urja-text-secondary">
                <thead className="bg-urja-bg/50 text-xs uppercase font-semibold text-urja-text-muted border-b border-urja-border">
                  <tr>
                    <th className="px-4 py-3">Department</th>
                    <th className="px-4 py-3 text-right">Vehicles</th>
                    <th className="px-4 py-3 text-right">Active</th>
                    <th className="px-4 py-3 text-right">Charging</th>
                    <th className="px-4 py-3 text-right">Offline</th>
                    <th className="px-4 py-3 text-right">Alerts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-urja-border">
                  {deptStats.map(dept => (
                    <tr
                      key={dept.id}
                      onClick={() => navigate(`/departments/${dept.id}`)}
                      className="hover:bg-urja-pale cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-urja-text">{dept.name}</td>
                      <td className="px-4 py-3 text-right">{dept.total}</td>
                      <td className="px-4 py-3 text-right text-urja-primary">{dept.active}</td>
                      <td className="px-4 py-3 text-right text-blue-400">{dept.charging}</td>
                      <td className="px-4 py-3 text-right text-urja-text-muted">{dept.offline}</td>
                      <td className="px-4 py-3 text-right text-urja-danger">{dept.alerts}</td>
                    </tr>
                  ))}
                  {deptStats.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-urja-text-muted">No departments found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            ) : (
              /* Department: Vehicle list */
              <table className="w-full text-left text-sm text-urja-text-secondary">
                <thead className="bg-urja-bg/50 text-xs uppercase font-semibold text-urja-text-muted border-b border-urja-border">
                  <tr>
                    <th className="px-4 py-3">Vehicle</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Battery</th>
                    <th className="px-4 py-3 text-right">Speed</th>
                    <th className="px-4 py-3 text-right">Last Seen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-urja-border">
                  {vehicles.slice(0, 10).map((v: VehicleWithTelemetryResponse) => {
                    const status = v.connectivity_status === 'offline' || !v.connectivity_status ? 'offline'
                      : v.charging ? 'charging'
                      : (v.speed_kph && v.speed_kph > 0) ? 'active' : 'idle';
                    const statusColor = status === 'active' ? 'text-urja-primary' : status === 'charging' ? 'text-blue-400' : status === 'offline' ? 'text-urja-text-muted' : 'text-urja-warning';
                    return (
                      <tr
                        key={v.id}
                        onClick={() => navigate(`/vehicles/${v.id}`)}
                        className="hover:bg-urja-pale cursor-pointer transition-colors"
                      >
                        <td className="px-4 py-3 font-medium text-urja-text">{v.vehicle_code}</td>
                        <td className={`px-4 py-3 capitalize ${statusColor}`}>{status}</td>
                        <td className="px-4 py-3 text-right">{v.soc_pct != null ? `${Math.round(v.soc_pct)}%` : '--'}</td>
                        <td className="px-4 py-3 text-right">{v.speed_kph ? `${Math.round(v.speed_kph)} km/h` : '0'}</td>
                        <td className="px-4 py-3 text-right text-urja-text-muted text-xs">{v.last_seen ? formatRelativeTime(v.last_seen) : '--'}</td>
                      </tr>
                    );
                  })}
                  {vehicles.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-urja-text-muted">No vehicles in your department</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Critical Alerts Panel */}
        <div className="lg:col-span-2 bg-urja-surface border border-urja-border rounded-2xl shadow-sm hover:shadow hover:border-urja-green-border hover:-translate-y-1 transition-all duration-200 flex flex-col">
          <div className="p-4 border-b border-urja-border flex justify-between items-center">
            <h2 className="text-lg font-semibold text-urja-text">Priority Alerts</h2>
            <span className="text-xs bg-urja-pale text-urja-text-secondary px-2 py-1 rounded-full">{criticalAlerts.length} Active</span>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {criticalAlerts.length > 0 ? (
              <div className="space-y-2">
                {criticalAlerts.map((alert: AlertResponse) => {
                  const vehicle = vehicles.find((v: VehicleWithTelemetryResponse) => v.id === alert.vehicle_id);
                  const isCritical = alert.severity === 'critical';
                  return (
                    <div key={alert.id} className="p-3 rounded-lg bg-urja-bg/50 border border-urja-border hover:border-urja-green-border transition-colors">
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded-sm ${isCritical ? 'bg-urja-danger/10 text-urja-danger' : 'bg-urja-warning/10 text-urja-warning'}`}>
                            {alert.severity}
                          </span>
                          <span className="text-sm font-medium text-urja-text">{alert.alert_type}</span>
                        </div>
                        <span className="text-xs text-urja-text-muted">{formatRelativeTime(alert.created_at)}</span>
                      </div>
                      <div className="text-xs text-urja-text-secondary mt-2 flex items-center gap-1">
                        <Car className="w-3 h-3" />
                        {vehicle ? vehicle.vehicle_code : alert.vehicle_id}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-urja-text-muted p-8 space-y-4">
                <div className="w-12 h-12 rounded-full bg-urja-pale flex items-center justify-center">
                  <Activity className="w-6 h-6 text-urja-text-muted" />
                </div>
                <p className="text-sm">No critical alerts at this time.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
