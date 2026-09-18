import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getVehicles } from '../api/vehicles';
import { getDepartments } from '../api/departments';
import { QUERY_KEYS } from '../utils/constants';
import { VehicleTypeLabels } from '../types/enums';
import { VehicleWithTelemetryResponse, DepartmentResponse } from '../types/api';
import { formatRelativeTime, getVehicleStatus } from '../utils/formatters';
import PageHeader from '../components/common/PageHeader';
import StatusBadge from '../components/common/StatusBadge';
import BatteryIndicator from '../components/common/BatteryIndicator';
import { SearchInput, FilterSelect } from '../components/common/FilterControls';
import { EmptyState, ErrorState } from '../components/common/FeedbackStates';

export default function Vehicles() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data: vehiclesData, isLoading: isLoadingVehicles, isError, refetch } = useQuery({
    queryKey: QUERY_KEYS.VEHICLES,
    queryFn: () => getVehicles(500, 0),
  });

  const { data: deptsData } = useQuery({
    queryKey: QUERY_KEYS.DEPARTMENTS,
    queryFn: () => getDepartments(200, 0),
  });

  const vehicles = vehiclesData ?? [];
  const departments = deptsData ?? [];

  const filteredVehicles = vehicles.filter((v: VehicleWithTelemetryResponse) => {
    if (searchTerm && !v.vehicle_code.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (deptFilter && v.department_id !== deptFilter) return false;

    const st = getVehicleStatus(v);
    if (statusFilter && st !== statusFilter) return false;

    return true;
  });

  if (isError) {
    return (
      <ErrorState
        title="Failed to Load Fleet Vehicles"
        message="Could not load vehicle records from API."
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rajasthan Government Fleet Registry"
        subtitle="Official registry of electric buses, emergency EVs, and municipal service vehicles."
        badgeText="FLEET REGISTRY"
        actions={
          <button
            onClick={() => navigate('/live-fleet')}
            className="yatra-btn-primary"
          >
            <span className="material-symbols-outlined text-base">map</span>
            Live Map Track
          </button>
        }
      />

      {/* Filter Toolbar */}
      <div className="yatra-card p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto flex-1">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search vehicle code..."
            className="w-full md:w-72"
          />

          <FilterSelect
            value={deptFilter}
            onChange={setDeptFilter}
            placeholder="All Departments"
            options={departments.map((d) => ({ value: d.id, label: d.name }))}
            className="w-full md:w-56"
          />

          <FilterSelect
            value={statusFilter}
            onChange={setStatusFilter}
            placeholder="All Statuses"
            options={[
              { value: 'active', label: 'Active' },
              { value: 'charging', label: 'Charging' },
              { value: 'idle', label: 'Idle' },
              { value: 'offline', label: 'Offline' },
            ]}
            className="w-full md:w-40"
          />
        </div>

        <div className="text-xs font-semibold text-slate-500 shrink-0">
          Showing <span className="text-slate-900 font-bold">{filteredVehicles.length}</span> of {vehicles.length} EVs
        </div>
      </div>

      {/* Fleet Table */}
      <div className="yatra-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Vehicle Code</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Operational Status</th>
                <th className="py-3 px-4">Battery (SOC)</th>
                <th className="py-3 px-4 text-right">Est. Range</th>
                <th className="py-3 px-4 text-right">Speed</th>
                <th className="py-3 px-4 text-right">Last Telemetry</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-800 font-medium">
              {isLoadingVehicles ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={8} className="py-4 px-4 bg-slate-50/50" />
                  </tr>
                ))
              ) : filteredVehicles.length > 0 ? (
                filteredVehicles.map((vehicle) => {
                  const st = getVehicleStatus(vehicle);
                  const dept = departments.find((d: DepartmentResponse) => d.id === vehicle.department_id);
                  const typeLabel = VehicleTypeLabels[vehicle.vehicle_type as keyof typeof VehicleTypeLabels] || vehicle.vehicle_type;

                  return (
                    <tr
                      key={vehicle.id}
                      onClick={() => navigate(`/vehicles/${vehicle.id}`)}
                      className="hover:bg-teal-50/50 cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 px-4 font-bold text-slate-900 tracking-wider">
                        {vehicle.vehicle_code}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{typeLabel}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">{dept?.name || 'Unassigned'}</td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={st} />
                      </td>
                      <td className="py-3.5 px-4">
                        <BatteryIndicator soc={vehicle.soc_pct} isCharging={vehicle.charging} />
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                        {vehicle.estimated_range_km ? `${Math.round(vehicle.estimated_range_km)} km` : 'N/A'}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                        {vehicle.speed_kph ? `${Math.round(vehicle.speed_kph)} km/h` : '0 km/h'}
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-500 text-[11px]">
                        {vehicle.last_seen ? formatRelativeTime(vehicle.last_seen) : 'N/A'}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-8">
                    <EmptyState
                      title="No Vehicles Found"
                      description="No fleet vehicles match your selected search term or filters."
                      icon="directions_bus"
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
