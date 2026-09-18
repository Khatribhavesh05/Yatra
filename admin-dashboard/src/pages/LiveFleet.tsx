import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Map, Search, X, Activity, Zap, Car, Filter, Navigation2 } from 'lucide-react';
import { getVehicles } from '../api/vehicles';
import { getDepartments } from '../api/departments';
import { QUERY_KEYS } from '../utils/constants';
import { VehicleWithTelemetryResponse, DepartmentResponse } from '../types/api';
// import { useVehicleStore } from '../hooks/useVehicleStore';
import { formatRelativeTime, formatBattery, formatSpeed, formatRange, getVehicleStatus } from '../utils/formatters';
import FleetMap from '../components/maps/FleetMap';

export default function LiveFleet() {
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [batteryFilter, setBatteryFilter] = useState('all');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);

  const { data: vehiclesData, isLoading: isLoadingVehicles } = useQuery({
    queryKey: QUERY_KEYS.VEHICLES,
    queryFn: () => getVehicles(500, 0)
  });

  const { data: deptsData } = useQuery({
    queryKey: QUERY_KEYS.DEPARTMENTS,
    queryFn: () => getDepartments(200, 0)
  });

  // Mock integration for useVehicleStore (assume hook returns latest data overriding initial)
  // const { latestVehicles } = useVehicleStore();
  
  const vehicles = vehiclesData ?? [];
  const departments = deptsData ?? [];

  const getStatus = (v: VehicleWithTelemetryResponse) => {
    if (v.connectivity_status === 'offline' || !v.connectivity_status) return 'offline';
    if (v.charging) return 'charging';
    if (v.speed_kph && v.speed_kph > 0) return 'active';
    return 'idle';
  };

  const filteredVehicles = vehicles.filter((v: VehicleWithTelemetryResponse) => {
    if (searchTerm && !v.vehicle_code.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (deptFilter !== 'all' && v.department_id !== deptFilter) return false;
    
    const status = getStatus(v);
    if (statusFilter !== 'all' && status !== statusFilter) return false;
    
    if (batteryFilter !== 'all' && v.soc_pct !== undefined && v.soc_pct !== null) {
      if (batteryFilter === '<20' && v.soc_pct >= 20) return false;
      if (batteryFilter === '20-50' && (v.soc_pct < 20 || v.soc_pct >= 50)) return false;
      if (batteryFilter === '50-80' && (v.soc_pct < 50 || v.soc_pct >= 80)) return false;
      if (batteryFilter === '>80' && v.soc_pct < 80) return false;
    }
    return true;
  });

  const selectedVehicle = vehicles.find((v: VehicleWithTelemetryResponse) => v.id === selectedVehicleId);
  const selectedDept = departments.find((d: DepartmentResponse) => d.id === selectedVehicle?.department_id);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'active': return 'bg-emerald-500';
      case 'charging': return 'bg-blue-500';
      case 'offline': return 'bg-slate-600';
      default: return 'bg-yellow-500'; // idle
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="bg-urja-surface border-b border-urja-border p-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-urja-text">Live Fleet Monitoring</h1>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-urja-danger/10 border border-urja-danger/20">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
            <span className="text-xs font-semibold text-urja-danger uppercase tracking-wider">Live</span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 bg-urja-bg border-r border-urja-border flex flex-col z-10 shrink-0 shadow-xl">
          <div className="p-4 space-y-4 border-b border-urja-border">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-urja-text-muted" />
              <input
                type="text"
                placeholder="Search vehicles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-urja-surface border border-urja-border rounded-lg pl-9 pr-4 py-2 text-sm text-urja-text placeholder-slate-500 focus:outline-none focus:border-urja-primary"
              />
            </div>
            
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="w-full bg-urja-surface border border-urja-border rounded-lg px-3 py-2 text-sm text-urja-text focus:outline-none focus:border-urja-primary"
            >
              <option value="all">All Departments</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>

            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {['all', 'active', 'charging', 'idle', 'offline'].map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1 rounded-full text-xs font-medium capitalize whitespace-nowrap transition-colors ${
                    statusFilter === status 
                      ? 'bg-slate-700 text-urja-text' 
                      : 'bg-urja-surface text-urja-text-secondary border border-urja-border hover:bg-urja-pale'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
            <div className="text-xs font-medium text-urja-text-muted pt-1">
              Showing {filteredVehicles.length} vehicles
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {isLoadingVehicles ? (
              <div className="p-4 text-center text-sm text-urja-text-muted">Loading fleet...</div>
            ) : filteredVehicles.length > 0 ? (
              filteredVehicles.map(vehicle => {
                const status = getStatus(vehicle);
                const dept = departments.find(d => d.id === vehicle.department_id);
                const isSelected = selectedVehicleId === vehicle.id;
                
                return (
                  <div 
                    key={vehicle.id}
                    onClick={() => setSelectedVehicleId(vehicle.id)}
                    className={`relative p-3 rounded-2xl border transition-all cursor-pointer overflow-hidden ${
                      isSelected 
                        ? 'bg-urja-pale border-slate-600 shadow-lg' 
                        : 'bg-urja-surface border-urja-border hover:border-urja-green-border hover:bg-urja-pale'
                    }`}
                  >
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${getStatusColor(status)}`}></div>
                    <div className="pl-2">
                      <div className="flex justify-between items-start mb-1">
                        <div className="font-semibold text-urja-text text-sm">{vehicle.vehicle_code}</div>
                        <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                          status === 'active' ? 'bg-emerald-500/20 text-urja-primary' :
                          status === 'charging' ? 'bg-blue-500/20 text-blue-400' :
                          status === 'offline' ? 'bg-slate-700 text-urja-text-secondary' :
                          'bg-yellow-500/20 text-urja-warning'
                        }`}>
                          {status}
                        </span>
                      </div>
                      <div className="text-xs text-urja-text-secondary mb-2 truncate">{dept?.name || 'Unknown Dept'}</div>
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-urja-text-muted" />
                          <span className={vehicle.soc_pct && vehicle.soc_pct < 20 ? 'text-urja-danger' : 'text-urja-text-secondary'}>
                            {vehicle.soc_pct ?? '--'}%
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Activity className="w-3.5 h-3.5 text-urja-text-muted" />
                          <span className="text-urja-text-secondary">{vehicle.speed_kph ? Math.round(vehicle.speed_kph) : 0} km/h</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-sm text-urja-text-muted">
                No vehicles match filters.
              </div>
            )}
          </div>
        </div>

        {/* Map Area */}
        <div className="flex-1 relative bg-urja-bg flex items-center justify-center">
          <div className="absolute inset-0 z-0">
            <FleetMap 
              vehicles={filteredVehicles} 
              selectedVehicleId={selectedVehicleId}
              onSelectVehicle={setSelectedVehicleId} 
            />
          </div>

          {/* Selected Vehicle Overlay */}
          {selectedVehicle && (
            <div className="absolute top-4 right-4 w-80 bg-urja-surface/95 backdrop-blur-md border border-urja-green-border rounded-2xl shadow-2xl z-20 overflow-hidden flex flex-col">
              <div className="p-4 border-b border-urja-border flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-urja-text">{selectedVehicle.vehicle_code}</h3>
                  <p className="text-xs text-urja-text-secondary">{selectedDept?.name}</p>
                </div>
                <button 
                  onClick={() => setSelectedVehicleId(null)}
                  className="p-1 hover:bg-urja-pale rounded-md text-urja-text-secondary hover:text-urja-text transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-4 space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-urja-text-secondary">Battery (SoC)</span>
                    <span className="font-medium text-urja-text">{selectedVehicle.soc_pct ?? 0}%</span>
                  </div>
                  <div className="w-full bg-urja-pale rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        (selectedVehicle.soc_pct || 0) > 50 ? 'bg-emerald-500' : 
                        (selectedVehicle.soc_pct || 0) > 20 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${selectedVehicle.soc_pct || 0}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-urja-bg p-3 rounded-lg border border-urja-border">
                    <div className="text-[10px] text-urja-text-muted uppercase font-semibold mb-1">Speed</div>
                    <div className="text-lg font-medium text-urja-text">
                      {selectedVehicle.speed_kph ? Math.round(selectedVehicle.speed_kph) : 0} <span className="text-xs text-urja-text-muted font-normal">km/h</span>
                    </div>
                  </div>
                  <div className="bg-urja-bg p-3 rounded-lg border border-urja-border">
                    <div className="text-[10px] text-urja-text-muted uppercase font-semibold mb-1">Est. Range</div>
                    <div className="text-lg font-medium text-urja-text">
                      {formatRange(selectedVehicle.estimated_range_km)}
                    </div>
                  </div>
                </div>

                <div className="bg-urja-bg p-3 rounded-lg border border-urja-border space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-urja-text-secondary flex items-center gap-2"><Navigation2 className="w-4 h-4" /> Coordinates</span>
                    <span className="text-urja-text font-mono text-xs">
                      {selectedVehicle.latitude?.toFixed(4) || '--'}, {selectedVehicle.longitude?.toFixed(4) || '--'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-urja-text-secondary flex items-center gap-2"><Activity className="w-4 h-4" /> Connectivity</span>
                    <span className="text-urja-text capitalize">{selectedVehicle.connectivity_status || 'Unknown'}</span>
                  </div>
                </div>
                
                <div className="text-xs text-center text-urja-text-muted pt-2 border-t border-urja-border">
                  Last updated: {selectedVehicle.last_seen ? formatRelativeTime(selectedVehicle.last_seen) : 'Never'}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
