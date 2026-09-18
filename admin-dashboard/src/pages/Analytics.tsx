import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { getVehicles } from '../api/vehicles';
import { getAlerts } from '../api/alerts';
import { getDepartments } from '../api/departments';
import { QUERY_KEYS } from '../utils/constants';
import { getVehicleStatus } from '../utils/formatters';
import { AlertTypeLabels } from '../types/enums';

const STATUS_COLORS = {
  active: '#10b981', // emerald
  charging: '#3b82f6', // blue
  idle: '#f59e0b', // amber
  offline: '#64748b', // slate
  critical: '#ef4444', // red
};

const BATTERY_COLORS = {
  '0-20%': '#ef4444',
  '20-40%': '#f97316',
  '40-60%': '#eab308',
  '60-80%': '#10b981',
  '80-100%': '#22c55e',
};

const SEVERITY_COLORS = {
  CRITICAL: '#ef4444',
  HIGH: '#f97316',
  MEDIUM: '#eab308',
  LOW: '#3b82f6',
};

export default function Analytics() {
  const { data: vehiclesData, isLoading: loadingVehicles } = useQuery({
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
    const statusChartData = Object.keys(statusCounts).map(k => ({
      name: k.charAt(0).toUpperCase() + k.slice(1),
      value: statusCounts[k],
      color: STATUS_COLORS[k as keyof typeof STATUS_COLORS] || '#64748b'
    }));

    // 2. Battery Distribution
    const batteryCounts = { '0-20%': 0, '20-40%': 0, '40-60%': 0, '60-80%': 0, '80-100%': 0 };
    vehicles.forEach((v: any) => {
      const soc = v.battery_soc || 0;
      if (soc <= 20) batteryCounts['0-20%']++;
      else if (soc <= 40) batteryCounts['20-40%']++;
      else if (soc <= 60) batteryCounts['40-60%']++;
      else if (soc <= 80) batteryCounts['60-80%']++;
      else batteryCounts['80-100%']++;
    });
    const batteryChartData = Object.entries(batteryCounts).map(([name, value]) => ({
      name,
      value,
      color: BATTERY_COLORS[name as keyof typeof BATTERY_COLORS]
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
      acc[a.severity] = (acc[a.severity] || 0) + 1;
      return acc;
    }, {});
    const severityData = Object.entries(severityCounts).map(([name, value]) => ({
      name,
      value,
      color: SEVERITY_COLORS[name as keyof typeof SEVERITY_COLORS] || '#64748b'
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
        name: deptMap[id] || 'Unknown',
        value
      }))
      .sort((a, b) => (b.value as number) - (a.value as number));

    return {
      statusChartData,
      batteryChartData,
      alertsTypeData,
      severityData,
      deptChartData,
      hasData: vehicles.length > 0 || alerts.length > 0
    };
  }, [vehiclesData, alertsData, deptsData]);

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center text-urja-text-secondary">Loading analytics data...</div>;
  }

  if (!chartData || !chartData.hasData) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-urja-text">Fleet Analytics</h1>
        <div className="rounded-2xl border border-urja-border bg-urja-surface/50 p-12 text-center text-urja-text-secondary">
          Start the simulator to generate analytics data
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-urja-green-border bg-urja-pale p-3 shadow-xl">
          <p className="mb-1 text-sm font-medium text-urja-text">{label || payload[0].name}</p>
          <p className="text-sm font-bold text-urja-primary">Count: {payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-urja-text">Fleet Analytics</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        
        {/* Status Distribution */}
        <div className="rounded-2xl border border-urja-border bg-urja-surface p-6 flex flex-col">
          <h3 className="text-lg font-medium text-urja-text mb-6">Fleet Status Distribution</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData.statusChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}>
                  {chartData.statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Battery Distribution */}
        <div className="rounded-2xl border border-urja-border bg-urja-surface p-6 flex flex-col">
          <h3 className="text-lg font-medium text-urja-text mb-6">Battery Distribution (SoC)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.batteryChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1e293b' }} />
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
        <div className="rounded-2xl border border-urja-border bg-urja-surface p-6 flex flex-col">
          <h3 className="text-lg font-medium text-urja-text mb-6">Vehicles by Department</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.deptChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1e293b' }} />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Alerts by Type */}
        <div className="rounded-2xl border border-urja-border bg-urja-surface p-6 flex flex-col lg:col-span-2">
          <h3 className="text-lg font-medium text-urja-text mb-6">Active Alerts by Type</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.alertsTypeData} layout="vertical" margin={{ left: 80 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                <XAxis type="number" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} allowDecimals={false} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} width={120} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1e293b' }} />
                <Bar dataKey="value" fill="#f59e0b" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Alerts by Severity */}
        <div className="rounded-2xl border border-urja-border bg-urja-surface p-6 flex flex-col">
          <h3 className="text-lg font-medium text-urja-text mb-6">Alerts by Severity</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData.severityData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                  {chartData.severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
