import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getVehicles } from '../api/vehicles';
import { getAlerts } from '../api/alerts';
import { getDepartments } from '../api/departments';
import { QUERY_KEYS } from '../utils/constants';
import { VehicleWithTelemetryResponse, AlertResponse, DepartmentResponse } from '../types/api';
import { formatRelativeTime, getVehicleStatus } from '../utils/formatters';
import { useAuth } from '../hooks/useAuth';
import { isPlatformAdmin } from '../utils/permissions';
import PageHeader from '../components/common/PageHeader';
import MetricCard from '../components/common/MetricCard';
import StatusBadge from '../components/common/StatusBadge';
import BatteryIndicator from '../components/common/BatteryIndicator';
import { EmptyState, ErrorState } from '../components/common/FeedbackStates';

export default function Overview() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user ? isPlatformAdmin(user.role) : false;

  const { data: vehiclesData, isLoading: isLoadingVehicles, isError: isErrorVehicles, refetch: refetchVehicles } = useQuery({
    queryKey: QUERY_KEYS.VEHICLES,
    queryFn: () => getVehicles(500, 0),
  });

  const { data: alertsData, isLoading: isLoadingAlerts, isError: isErrorAlerts, refetch: refetchAlerts } = useQuery({
    queryKey: QUERY_KEYS.ALERTS,
    queryFn: () => getAlerts('active', 200, 0),
  });

  const { data: deptsData, isLoading: isLoadingDepts } = useQuery({
    queryKey: QUERY_KEYS.DEPARTMENTS,
    queryFn: () => getDepartments(200, 0),
    enabled: isAdmin,
  });

  const vehicles = vehiclesData ?? [];
  const alerts = alertsData ?? [];
  const departments = deptsData ?? [];

  const totalEVs = vehicles.length;
  const activeEVs = vehicles.filter((v: VehicleWithTelemetryResponse) => getVehicleStatus(v) === 'active').length;
  const chargingEVs = vehicles.filter((v: VehicleWithTelemetryResponse) => getVehicleStatus(v) === 'charging').length;
  const offlineEVs = vehicles.filter((v: VehicleWithTelemetryResponse) => getVehicleStatus(v) === 'offline').length;
  const lowBatteryEVs = vehicles.filter((v: VehicleWithTelemetryResponse) => v.soc_pct !== null && v.soc_pct < 20).length;
  const criticalAlertsCount = alerts.filter((a: AlertResponse) => a.severity === 'critical' && a.status === 'active').length;

  const vehiclesWithSoc = vehicles.filter((v: VehicleWithTelemetryResponse) => v.soc_pct != null);
  const avgBattery =
    vehiclesWithSoc.length > 0
      ? Math.round(vehiclesWithSoc.reduce((sum, v) => sum + (v.soc_pct || 0), 0) / vehiclesWithSoc.length)
      : 0;

  const deptStats = departments.map((dept: DepartmentResponse) => {
    const deptVehicles = vehicles.filter((v: VehicleWithTelemetryResponse) => v.department_id === dept.id);
    return {
      ...dept,
      total: deptVehicles.length,
      active: deptVehicles.filter((v: VehicleWithTelemetryResponse) => getVehicleStatus(v) === 'active').length,
      charging: deptVehicles.filter((v: VehicleWithTelemetryResponse) => getVehicleStatus(v) === 'charging').length,
      offline: deptVehicles.filter((v: VehicleWithTelemetryResponse) => getVehicleStatus(v) === 'offline').length,
      alerts: alerts.filter(
        (a: AlertResponse) => a.status === 'active' && deptVehicles.some((v: VehicleWithTelemetryResponse) => v.id === a.vehicle_id)
      ).length,
    };
  }).sort((a, b) => b.total - a.total);

  const priorityAlerts = alerts
    .filter((a: AlertResponse) => a.status === 'active')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 7);

  const isLoading = isLoadingVehicles || isLoadingAlerts || (isAdmin && isLoadingDepts);

  if (isErrorVehicles || isErrorAlerts) {
    return (
      <ErrorState
        title="Failed to Load Executive Overview"
        message="Could not retrieve live fleet status or alert feed. Please verify API connection."
        onRetry={() => {
          refetchVehicles();
          refetchAlerts();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Title & Header */}
      <PageHeader
        title={isAdmin ? 'Executive Fleet Intelligence' : `${user?.department_name || 'Department'} Operations Overview`}
        subtitle="Real-time operational summary, battery health distribution, and priority alert monitoring."
        badgeText="COMMAND CENTER"
        actions={
          <button
            onClick={() => navigate('/live-fleet')}
            className="yatra-btn-primary"
          >
            <span className="material-symbols-outlined text-base">map</span>
            Open Live Map
          </button>
        }
      />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <MetricCard
          title="Total Fleet"
          value={isLoading ? '...' : totalEVs}
          subtitle="Registered EVs"
          icon="directions_bus"
          accentColor="teal"
          onClick={() => navigate('/vehicles')}
        />
        <MetricCard
          title="Active EVs"
          value={isLoading ? '...' : activeEVs}
          subtitle="In Transit / Online"
          icon="electric_bolt"
          accentColor="teal"
          trend={{ text: `${totalEVs > 0 ? Math.round((activeEVs / totalEVs) * 100) : 0}% fleet`, type: 'positive' }}
          onClick={() => navigate('/vehicles')}
        />
        <MetricCard
          title="Charging"
          value={isLoading ? '...' : chargingEVs}
          subtitle="At Stations"
          icon="ev_station"
          accentColor="blue"
          onClick={() => navigate('/charging')}
        />
        <MetricCard
          title="Offline"
          value={isLoading ? '...' : offlineEVs}
          subtitle="No Signal / Parked"
          icon="wifi_off"
          accentColor="slate"
          onClick={() => navigate('/vehicles')}
        />
        <MetricCard
          title="Low Battery"
          value={isLoading ? '...' : lowBatteryEVs}
          subtitle="< 20% Charge"
          icon="battery_alert"
          accentColor="amber"
          onClick={() => navigate('/vehicles')}
        />
        <MetricCard
          title="Critical Alerts"
          value={isLoading ? '...' : criticalAlertsCount}
          subtitle="Requires Action"
          icon="warning"
          accentColor="rose"
          onClick={() => navigate('/alerts')}
        />
      </div>

      {/* Main Grid: Left Operational Snapshot + Right Priority Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Fleet Status or Department Summary */}
        <div className="lg:col-span-2 space-y-6">
          <div className="yatra-card p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  {isAdmin ? 'Department Operational Breakdown' : 'Vehicle Telemetry Status'}
                </h3>
                <p className="text-xs text-slate-500">
                  {isAdmin ? 'Live fleet distribution across Rajasthan government departments' : 'Recent active vehicle telemetry records'}
                </p>
              </div>
              <button
                onClick={() => navigate(isAdmin ? '/departments' : '/vehicles')}
                className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1"
              >
                View All <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>

            {isAdmin ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200">
                      <th className="py-2.5 px-3">Department</th>
                      <th className="py-2.5 px-3 text-right">Fleet</th>
                      <th className="py-2.5 px-3 text-right">Active</th>
                      <th className="py-2.5 px-3 text-right">Charging</th>
                      <th className="py-2.5 px-3 text-right">Offline</th>
                      <th className="py-2.5 px-3 text-right">Alerts</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-800">
                    {deptStats.map((dept) => (
                      <tr
                        key={dept.id}
                        onClick={() => navigate(`/departments/${dept.id}`)}
                        className="hover:bg-teal-50/50 cursor-pointer transition-colors"
                      >
                        <td className="py-2.5 px-3 font-semibold text-slate-900">{dept.name}</td>
                        <td className="py-2.5 px-3 text-right">{dept.total}</td>
                        <td className="py-2.5 px-3 text-right text-teal-700 font-bold">{dept.active}</td>
                        <td className="py-2.5 px-3 text-right text-blue-700 font-bold">{dept.charging}</td>
                        <td className="py-2.5 px-3 text-right text-slate-400">{dept.offline}</td>
                        <td className="py-2.5 px-3 text-right text-rose-600 font-bold">{dept.alerts}</td>
                      </tr>
                    ))}
                    {deptStats.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-slate-400">No department records available</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200">
                      <th className="py-2.5 px-3">Vehicle Code</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Battery (SOC)</th>
                      <th className="py-2.5 px-3 text-right">Speed</th>
                      <th className="py-2.5 px-3 text-right">Last Telemetry</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-800">
                    {vehicles.slice(0, 8).map((v) => {
                      const st = getVehicleStatus(v);
                      return (
                        <tr
                          key={v.id}
                          onClick={() => navigate(`/vehicles/${v.id}`)}
                          className="hover:bg-teal-50/50 cursor-pointer transition-colors"
                        >
                          <td className="py-2.5 px-3 font-semibold text-slate-900">{v.vehicle_code}</td>
                          <td className="py-2.5 px-3">
                            <StatusBadge status={st} size="sm" />
                          </td>
                          <td className="py-2.5 px-3">
                            <BatteryIndicator soc={v.soc_pct} isCharging={v.charging} size="sm" />
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                            {v.speed_kph ? `${Math.round(v.speed_kph)} km/h` : '0 km/h'}
                          </td>
                          <td className="py-2.5 px-3 text-right text-slate-500 text-[11px]">
                            {v.last_seen ? formatRelativeTime(v.last_seen) : 'N/A'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Battery Health Intelligence Summary */}
          <div className="yatra-card p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">State Battery Health Intelligence</h3>
                <p className="text-xs text-slate-500">Fleet average State of Charge (SOC) and critical threshold alerts</p>
              </div>
              <span className="text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-md">
                Avg SOC: {avgBattery}%
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[11px] font-bold text-slate-500 uppercase">Optimal (&gt; 50%)</span>
                <div className="text-xl font-extrabold text-teal-700 mt-1">
                  {vehicles.filter((v) => (v.soc_pct || 0) > 50).length} EVs
                </div>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[11px] font-bold text-slate-500 uppercase">Moderate (20% - 50%)</span>
                <div className="text-xl font-extrabold text-amber-600 mt-1">
                  {vehicles.filter((v) => (v.soc_pct || 0) >= 20 && (v.soc_pct || 0) <= 50).length} EVs
                </div>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[11px] font-bold text-slate-500 uppercase">Critical (&lt; 20%)</span>
                <div className="text-xl font-extrabold text-rose-600 mt-1">
                  {lowBatteryEVs} EVs
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Priority Incident Alerts Feed */}
        <div className="yatra-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Priority Incident Feed</h3>
                <p className="text-xs text-slate-500">Active alerts requiring officer review</p>
              </div>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                {priorityAlerts.length} Active
              </span>
            </div>

            {priorityAlerts.length > 0 ? (
              <div className="space-y-3">
                {priorityAlerts.map((alert: AlertResponse) => {
                  const v = vehicles.find((veh) => veh.id === alert.vehicle_id);
                  return (
                    <div
                      key={alert.id}
                      onClick={() => navigate('/alerts')}
                      className="p-3 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl transition-all cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <StatusBadge status={alert.severity} size="sm" />
                        <span className="text-[11px] text-slate-400 font-medium">
                          {formatRelativeTime(alert.created_at)}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900">{alert.alert_type}</h4>
                      <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-1">
                        {alert.resolution_note || `Severity: ${alert.severity}`}
                      </p>
                      <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                        <span className="font-semibold text-slate-700">
                          {v ? v.vehicle_code : alert.vehicle_id.slice(0, 8)}
                        </span>
                        <span className="text-teal-700 font-medium hover:underline">Details &rarr;</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                title="No Active Alerts"
                description="All fleet systems and battery levels are currently within safe parameters."
                icon="check_circle"
              />
            )}
          </div>

          <button
            onClick={() => navigate('/alerts')}
            className="w-full mt-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors text-center"
          >
            View Incident Command Feed &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}
