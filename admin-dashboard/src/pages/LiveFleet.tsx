import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getVehicles } from '../api/vehicles';
import { getDepartments } from '../api/departments';
import { QUERY_KEYS } from '../utils/constants';
import { VehicleWithTelemetryResponse, DepartmentResponse } from '../types/api';
import { useWebSocket } from '../hooks/useWebSocket';
import { formatRelativeTime, formatRange, getVehicleStatus } from '../utils/formatters';
import FleetMap from '../components/maps/FleetMap';
import StatusBadge from '../components/common/StatusBadge';
import BatteryIndicator from '../components/common/BatteryIndicator';
import { SearchInput, FilterSelect } from '../components/common/FilterControls';

export default function LiveFleet() {
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [liveUpdates, setLiveUpdates] = useState<Record<string, Partial<VehicleWithTelemetryResponse>>>({});

  const { subscribe } = useWebSocket();

  const { data: vehiclesData, isLoading: isLoadingVehicles } = useQuery({
    queryKey: QUERY_KEYS.VEHICLES,
    queryFn: () => getVehicles(500, 0),
  });

  const { data: deptsData } = useQuery({
    queryKey: QUERY_KEYS.DEPARTMENTS,
    queryFn: () => getDepartments(200, 0),
  });

  // Wire real-time WebSocket telemetry stream
  useEffect(() => {
    const unsubscribe = subscribe((msg) => {
      if (msg.type === 'telemetry_update' && msg.data) {
        const telemetry = msg.data as any;
        const vehicleId = telemetry.vehicle_id;
        if (vehicleId) {
          setLiveUpdates((prev) => ({
            ...prev,
            [vehicleId]: {
              latitude: telemetry.latitude,
              longitude: telemetry.longitude,
              speed_kph: telemetry.speed_kph,
              soc_pct: telemetry.soc_pct,
              heading_deg: telemetry.heading_deg,
              charging: telemetry.charging,
              connectivity_status: telemetry.connectivity_status || 'online',
              last_seen: telemetry.observed_at || new Date().toISOString(),
            },
          }));
        }
      }
    });
    return () => unsubscribe();
  }, [subscribe]);

  const rawVehicles = vehiclesData ?? [];
  const departments = deptsData ?? [];

  // Merge REST snapshot with real-time WebSocket updates
  const vehicles: VehicleWithTelemetryResponse[] = rawVehicles.map((v) => {
    const update = liveUpdates[v.id];
    return update ? { ...v, ...update } : v;
  });

  const filteredVehicles = vehicles.filter((v: VehicleWithTelemetryResponse) => {
    if (searchTerm && !v.vehicle_code.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (deptFilter && v.department_id !== deptFilter) return false;

    const st = getVehicleStatus(v);
    if (statusFilter && st !== statusFilter) return false;

    return true;
  });

  const selectedVehicle = vehicles.find((v: VehicleWithTelemetryResponse) => v.id === selectedVehicleId);
  const selectedDept = departments.find((d: DepartmentResponse) => d.id === selectedVehicle?.department_id);

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] -m-4 sm:-m-6 overflow-hidden bg-slate-900">
      {/* Top Command Bar */}
      <div className="bg-slate-950 border-b border-slate-800 px-6 py-3 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded-lg">
            <span className="material-symbols-outlined text-xl">map</span>
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-tight">Live Fleet Command Map</h1>
            <p className="text-[11px] text-slate-400">Rajasthan Real-Time EV Telemetry & Position Tracking</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-2 px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 font-semibold">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping" />
            Showing {filteredVehicles.length} of {vehicles.length} EVs
          </span>
        </div>
      </div>

      {/* Main Split Interface */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Vehicle Control Panel */}
        <div className="w-80 sm:w-88 bg-slate-900 border-r border-slate-800 flex flex-col z-20 shrink-0 shadow-2xl">
          <div className="p-4 space-y-3 border-b border-slate-800 bg-slate-950/40">
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search code or ID..."
            />

            <div className="grid grid-cols-2 gap-2">
              <FilterSelect
                value={deptFilter}
                onChange={setDeptFilter}
                placeholder="All Departments"
                options={departments.map((d) => ({ value: d.id, label: d.name }))}
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
              />
            </div>
          </div>

          {/* Vehicle List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {isLoadingVehicles ? (
              <div className="p-6 text-center text-xs text-slate-400 font-medium">
                Loading live fleet positions...
              </div>
            ) : filteredVehicles.length > 0 ? (
              filteredVehicles.map((vehicle) => {
                const st = getVehicleStatus(vehicle);
                const dept = departments.find((d) => d.id === vehicle.department_id);
                const isSelected = selectedVehicleId === vehicle.id;

                return (
                  <div
                    key={vehicle.id}
                    onClick={() => setSelectedVehicleId(vehicle.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-800 border-teal-500 shadow-lg'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-white text-xs tracking-wider">
                        {vehicle.vehicle_code}
                      </span>
                      <StatusBadge status={st} size="sm" />
                    </div>

                    <div className="text-[11px] text-slate-400 truncate mb-2">
                      {dept?.name || 'Unassigned Dept'}
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/60">
                      <BatteryIndicator soc={vehicle.soc_pct} isCharging={vehicle.charging} size="sm" />
                      <span className="font-mono font-bold text-slate-300 text-[11px]">
                        {vehicle.speed_kph ? `${Math.round(vehicle.speed_kph)} km/h` : '0 km/h'}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-xs text-slate-500">
                No vehicles match current filters.
              </div>
            )}
          </div>
        </div>

        {/* Center Operational Map Area */}
        <div className="flex-1 relative bg-slate-950">
          <FleetMap
            vehicles={filteredVehicles}
            selectedVehicleId={selectedVehicleId}
            onSelectVehicle={setSelectedVehicleId}
          />

          {/* Selected Vehicle Operational Dossier Overlay */}
          {selectedVehicle && (
            <div className="absolute top-4 right-4 w-84 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-xl shadow-2xl z-30 p-4 text-white space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-sm font-extrabold text-white tracking-wider">
                    {selectedVehicle.vehicle_code}
                  </h3>
                  <p className="text-xs text-slate-400">{selectedDept?.name || 'Department'}</p>
                </div>
                <button
                  onClick={() => setSelectedVehicleId(null)}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-semibold uppercase">Operational Status</span>
                  <StatusBadge status={getVehicleStatus(selectedVehicle)} />
                </div>

                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-400 font-semibold">State of Charge (SOC)</span>
                    <span className="font-mono font-bold text-teal-400">{selectedVehicle.soc_pct ?? 0}%</span>
                  </div>
                  <BatteryIndicator soc={selectedVehicle.soc_pct} isCharging={selectedVehicle.charging} size="lg" />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Current Speed</span>
                    <div className="text-sm font-extrabold text-slate-200 mt-0.5">
                      {selectedVehicle.speed_kph ? `${Math.round(selectedVehicle.speed_kph)} km/h` : '0 km/h'}
                    </div>
                  </div>
                  <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Est. Range</span>
                    <div className="text-sm font-extrabold text-slate-200 mt-0.5">
                      {formatRange(selectedVehicle.estimated_range_km)}
                    </div>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">GPS Coordinates</span>
                    <span className="font-mono font-bold text-slate-200 text-[11px]">
                      {selectedVehicle.latitude?.toFixed(4)}, {selectedVehicle.longitude?.toFixed(4)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Last Telemetry Update</span>
                    <span className="text-slate-300 text-[11px]">
                      {selectedVehicle.last_seen ? formatRelativeTime(selectedVehicle.last_seen) : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
