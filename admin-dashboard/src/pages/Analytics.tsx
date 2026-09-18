import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { getVehicles } from '../api/vehicles';
import { getAlerts } from '../api/alerts';
import { getDepartments } from '../api/departments';
import { QUERY_KEYS } from '../utils/constants';
import { getVehicleStatus } from '../utils/formatters';
import { AlertTypeLabels } from '../types/enums';
import PageHeader from '../components/common/PageHeader';
import { EmptyState, ErrorState } from '../components/common/FeedbackStates';

const STATUS_COLORS = {
  active: '#0D9488', // teal
  charging: '#2563EB', // blue
  idle: '#D97706', // amber
  offline: '#64748B', // slate
  critical: '#DC2626', // rose
};

const BATTERY_COLORS = {
  '0-20%': '#DC2626',
  '20-40%': '#F97316',
  '40-60%': '#D97706',
  '60-80%': '#0D9488',
  '80-100%': '#059669',
};

const SEVERITY_COLORS = {
  CRITICAL: '#DC2626',
  HIGH: '#EA580C',
  MEDIUM: '#D97706',
  LOW: '#2563EB',
  INFO: '#64748B',
};

export default function Analytics() {
  const { data: vehiclesData, isLoading: loadingVehicles, isError: errorVehicles, refetch: refetchVehicles } = useQuery({
    queryKey: [QUERY_KEYS.VEHICLES, 500, 0],
    queryFn: () => getVehicles(500, 0),
  });

  const { data: alertsData, isLoading: loadingAlerts } = useQuery({
    queryKey: [QUERY_KEYS.ALERTS, undefined, 200, 0],
    queryFn: () => getAlerts(undefined, 200, 0),
  });

  const { data: deptsData, isLoading: loadingDepts } = useQuery({
    queryKey: [QUERY_KEYS.DEPARTMENTS, 100, 0],
    queryFn: () => getDepartments(100, 0),
  });

  const isLoading = loadingVehicles || loadingAlerts || loadingDepts;

  const chartData = useMemo(() => {
    if (!vehiclesData || !alertsData || !deptsData) return null;

    const vehicles = vehiclesData;
    const alerts = alertsData;
    const departments = deptsData;

    // 1. Status Distribution
    const statusCounts = vehicles.reduce((acc: any, v: any) => {
      const status = getVehicleStatus(v).toLowerCase();
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    const statusChartData = Object.keys(statusCounts).map((k) => ({
      name: k.toUpperCase(),
      value: statusCounts[k],
      color: STATUS_COLORS[k as keyof typeof STATUS_COLORS] || '#64748b',
    }));

    // 2. Battery Distribution
    const batteryCounts = { '0-20%': 0, '20-40%': 0, '40-60%': 0, '60-80%': 0, '80-100%': 0 };
    vehicles.forEach((v: any) => {
      const soc = v.soc_pct ?? 0;
      if (soc <= 20) batteryCounts['0-20%']++;
      else if (soc <= 40) batteryCounts['20-40%']++;
      else if (soc <= 60) batteryCounts['40-60%']++;
      else if (soc <= 80) batteryCounts['60-80%']++;
      else batteryCounts['80-100%']++;
    });
    const batteryChartData = Object.entries(batteryCounts).map(([name, value]) => ({
      name,
      value,
      color: BATTERY_COLORS[name as keyof typeof BATTERY_COLORS],
    }));

    // 3. Alerts by Type
    const typeCounts = alerts.reduce((acc: any, a: any) => {
      const label = AlertTypeLabels[a.alert_type as keyof typeof AlertTypeLabels] || a.alert_type;
      acc[label] = (acc[label] || 0) + 1;
      return acc;
    }, {});
    const alertsTypeData = Object.entries(typeCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => (b.value as number) - (a.value as number));

    // 4. Alerts by Severity
    const severityCounts = alerts.reduce((acc: any, a: any) => {
      const sev = (a.severity || 'INFO').toUpperCase();
      acc[sev] = (acc[sev] || 0) + 1;
      return acc;
    }, {});
    const severityData = Object.entries(severityCounts).map(([name, value]) => ({
      name,
      value,
      color: SEVERITY_COLORS[name as keyof typeof SEVERITY_COLORS] || '#64748B',
    }));

    // 5. Department Fleet
    const deptCounts = vehicles.reduce((acc: any, v: any) => {
      const deptId = v.department_id;
      if (deptId) {
        acc[deptId] = (acc[deptId] || 0) + 1;
      }
      return acc;
    }, {});
    const deptMap = departments.reduce((acc: any, d: any) => {
      acc[d.id] = d.name;
      return acc;
    }, {});
    const deptChartData = Object.entries(deptCounts)
      .map(([id, value]) => ({
        name: deptMap[id] || 'Unassigned',
        value,
      }))
      .sort((a, b) => (b.value as number) - (a.value as number));

    return {
      statusChartData,
      batteryChartData,
      alertsTypeData,
      severityData,
      deptChartData,
      hasData: vehicles.length > 0 || alerts.length > 0,
    };
  }, [vehiclesData, alertsData, deptsData]);

  if (errorVehicles) {
    return (
      <ErrorState
        title="Failed to Load Operational Analytics"
        message="Could not fetch fleet metrics for decision support analytics."
        onRetry={refetchVehicles}
      />
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700 p-2.5 rounded-lg shadow-xl text-white text-xs font-medium">
          <p className="font-bold text-slate-200">{label || payload[0].name}</p>
          <p className="text-teal-400 font-mono mt-1 font-bold">Count: {payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Decision-Support Analytics"
        subtitle="Real-time operational distribution, battery health metrics, and incident intelligence."
        badgeText="ANALYTICS"
      />

      {isLoading ? (
        <div className="py-16 text-center text-xs font-semibold text-slate-500">
          Aggregating telemetry analytics...
        </div>
      ) : !chartData || !chartData.hasData ? (
        <EmptyState
          title="No Operational Data Available"
          description="Analytics charts will populate as active telemetry and vehicle records stream into Yatra."
          icon="analytics"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Status Distribution */}
          <div className="yatra-card p-5 flex flex-col">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
              Fleet Operational Status Distribution
            </h3>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData.statusChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={4}
                  >
                    {chartData.statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Battery Distribution */}
          <div className="yatra-card p-5 flex flex-col">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
              Battery Health Distribution (SOC)
            </h3>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.batteryChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11, fill: '#475569' }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 11, fill: '#475569' }} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {chartData.batteryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Department Fleet Comparison */}
          <div className="yatra-card p-5 flex flex-col">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
              Vehicles Assigned per Department
            </h3>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.deptChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11, fill: '#475569' }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 11, fill: '#475569' }} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" fill="#0D9488" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Alerts by Type */}
          <div className="yatra-card p-5 flex flex-col lg:col-span-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
              Active Alerts Distribution by Type
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.alertsTypeData} layout="vertical" margin={{ left: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                  <XAxis type="number" stroke="#64748b" tick={{ fontSize: 11, fill: '#475569' }} allowDecimals={false} />
                  <YAxis dataKey="name" type="category" stroke="#64748b" tick={{ fontSize: 11, fill: '#475569' }} width={140} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" fill="#D97706" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Alerts by Severity */}
          <div className="yatra-card p-5 flex flex-col">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
              Incident Severity Breakout
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData.severityData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                  >
                    {chartData.severityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
