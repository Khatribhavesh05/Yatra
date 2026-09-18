import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react';
import { getVehicles } from '../api/vehicles';
import { getDepartments } from '../api/departments';
import { QUERY_KEYS } from '../utils/constants';
import { VehicleTypeLabels } from '../types/enums';
import { VehicleWithTelemetryResponse, DepartmentResponse } from '../types/api';
import { formatRelativeTime } from '../utils/formatters';

export default function Vehicles() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const [sortConfig, setSortConfig] = useState<{key: keyof VehicleWithTelemetryResponse | 'status' | 'department', direction: 'asc' | 'desc'} | null>(null);

  const { data: vehiclesData, isLoading: isLoadingVehicles } = useQuery({
    queryKey: QUERY_KEYS.VEHICLES,
    queryFn: () => getVehicles(500, 0)
  });

  const { data: deptsData } = useQuery({
    queryKey: QUERY_KEYS.DEPARTMENTS,
    queryFn: () => getDepartments(200, 0)
  });

  const vehicles = vehiclesData ?? [];
  const departments = deptsData ?? [];

  const getStatus = (v: VehicleWithTelemetryResponse) => {
    if (v.connectivity_status === 'offline' || !v.connectivity_status) return 'offline';
    if (v.charging) return 'charging';
    if (v.speed_kph && v.speed_kph > 0) return 'active';
    return 'idle';
  };

  const filteredVehicles = vehicles.filter((v: VehicleWithTelemetryResponse) => {
    if (searchTerm && 
        !v.vehicle_code.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (deptFilter !== 'all' && v.department_id !== deptFilter) return false;
    if (statusFilter !== 'all' && getStatus(v) !== statusFilter) return false;
    return true;
  });

  const sortedVehicles = [...filteredVehicles].sort((a: VehicleWithTelemetryResponse, b: VehicleWithTelemetryResponse) => {
    if (!sortConfig) return 0;
    
    let aVal: any = a[sortConfig.key as keyof VehicleWithTelemetryResponse];
    let bVal: any = b[sortConfig.key as keyof VehicleWithTelemetryResponse];

    if (sortConfig.key === 'status') {
      aVal = getStatus(a);
      bVal = getStatus(b);
    } else if (sortConfig.key === 'department') {
      aVal = departments.find((d: DepartmentResponse) => d.id === a.department_id)?.name || '';
      bVal = departments.find((d: DepartmentResponse) => d.id === b.department_id)?.name || '';
    }

    if (aVal === bVal) return 0;
    if (aVal == null) return 1;
    if (bVal == null) return -1;
    
    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    return sortConfig.direction === 'asc' ? 1 : -1;
  });

  const handleSort = (key: keyof VehicleWithTelemetryResponse | 'status' | 'department') => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    if (sortConfig?.key !== columnKey) return <ChevronDown className="w-4 h-4 opacity-20" />;
    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="w-4 h-4 text-urja-primary" />
      : <ChevronDown className="w-4 h-4 text-urja-primary" />;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-urja-text">Fleet Vehicles</h1>
        <div className="text-sm text-urja-text-secondary">
          Total: <span className="font-semibold text-urja-text">{filteredVehicles.length}</span> vehicles
        </div>
      </div>

      <div className="bg-urja-surface border border-urja-border rounded-2xl shadow-sm hover:shadow hover:border-urja-green-border hover:-translate-y-1 transition-all duration-200 p-4 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-urja-text-muted" />
          <input
            type="text"
            placeholder="Search code or make..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-urja-bg border border-urja-border rounded-lg pl-9 pr-4 py-2 text-sm text-urja-text placeholder-slate-500 focus:outline-none focus:border-urja-primary"
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="bg-urja-bg border border-urja-border rounded-lg px-4 py-2 text-sm text-urja-text focus:outline-none focus:border-urja-primary min-w-[200px]"
          >
            <option value="all">All Departments</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-urja-bg border border-urja-border rounded-lg px-4 py-2 text-sm text-urja-text focus:outline-none focus:border-urja-primary min-w-[150px]"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="charging">Charging</option>
            <option value="idle">Idle</option>
            <option value="offline">Offline</option>
          </select>
        </div>
      </div>

      <div className="bg-urja-surface border border-urja-border rounded-2xl shadow-sm hover:shadow hover:border-urja-green-border hover:-translate-y-1 transition-all duration-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-urja-text-secondary">
            <thead className="bg-urja-bg/50 text-xs uppercase font-semibold text-urja-text-muted border-b border-urja-border">
              <tr>
                <th className="px-6 py-4 cursor-pointer hover:bg-urja-pale transition-colors" onClick={() => handleSort('vehicle_code')}>
                  <div className="flex items-center gap-1">Code <SortIcon columnKey="vehicle_code" /></div>
                </th>
                <th className="px-6 py-4 cursor-pointer hover:bg-urja-pale transition-colors" onClick={() => handleSort('vehicle_type')}>
                  <div className="flex items-center gap-1">Type <SortIcon columnKey="vehicle_type" /></div>
                </th>
                <th className="px-6 py-4 cursor-pointer hover:bg-urja-pale transition-colors" onClick={() => handleSort('department')}>
                  <div className="flex items-center gap-1">Department <SortIcon columnKey="department" /></div>
                </th>
                <th className="px-6 py-4 cursor-pointer hover:bg-urja-pale transition-colors" onClick={() => handleSort('status')}>
                  <div className="flex items-center gap-1">Status <SortIcon columnKey="status" /></div>
                </th>
                <th className="px-6 py-4 cursor-pointer hover:bg-urja-pale transition-colors" onClick={() => handleSort('soc_pct')}>
                  <div className="flex items-center gap-1">Battery <SortIcon columnKey="soc_pct" /></div>
                </th>
                <th className="px-6 py-4 cursor-pointer hover:bg-urja-pale transition-colors" onClick={() => handleSort('estimated_range_km')}>
                  <div className="flex items-center gap-1">Range <SortIcon columnKey="estimated_range_km" /></div>
                </th>
                <th className="px-6 py-4 cursor-pointer hover:bg-urja-pale transition-colors" onClick={() => handleSort('speed_kph')}>
                  <div className="flex items-center gap-1">Speed <SortIcon columnKey="speed_kph" /></div>
                </th>
                <th className="px-6 py-4 cursor-pointer hover:bg-urja-pale transition-colors" onClick={() => handleSort('last_seen')}>
                  <div className="flex items-center gap-1">Last Seen <SortIcon columnKey="last_seen" /></div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-urja-border">
              {isLoadingVehicles ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-urja-pale rounded w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-urja-pale rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-urja-pale rounded w-32"></div></td>
                    <td className="px-6 py-4"><div className="h-6 bg-urja-pale rounded w-16"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-urja-pale rounded w-16"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-urja-pale rounded w-12"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-urja-pale rounded w-12"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-urja-pale rounded w-20"></div></td>
                  </tr>
                ))
              ) : sortedVehicles.length > 0 ? (
                sortedVehicles.map(vehicle => {
                  const status = getStatus(vehicle);
                  const deptName = departments.find(d => d.id === vehicle.department_id)?.name || 'Unknown';
                  const typeLabel = VehicleTypeLabels[vehicle.vehicle_type as keyof typeof VehicleTypeLabels] || vehicle.vehicle_type;

                  return (
                    <tr 
                      key={vehicle.id} 
                      onClick={() => navigate(`/vehicles/${vehicle.id}`)}
                      className="hover:bg-urja-pale cursor-pointer transition-colors group"
                    >
                      <td className="px-6 py-4 font-medium text-urja-text group-hover:text-urja-primary transition-colors">
                        {vehicle.vehicle_code}
                      </td>
                      <td className="px-6 py-4">{typeLabel}</td>
                      <td className="px-6 py-4 truncate max-w-[150px]">{deptName}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold ${
                          status === 'active' ? 'bg-urja-success/10 text-urja-primary border border-urja-success/20' :
                          status === 'charging' ? 'bg-urja-info/10 text-blue-400 border border-urja-info/20' :
                          status === 'offline' ? 'bg-urja-border/50 text-urja-text-secondary border border-urja-border' :
                          'bg-yellow-500/10 text-urja-warning border border-yellow-500/20'
                        }`}>
                          {status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-urja-pale rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                (vehicle.soc_pct || 0) > 50 ? 'bg-emerald-500' : 
                                (vehicle.soc_pct || 0) > 20 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${vehicle.soc_pct || 0}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-urja-text-secondary">{vehicle.soc_pct ?? '--'}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">{vehicle.estimated_range_km ? `${Math.round(vehicle.estimated_range_km)} km` : '--'}</td>
                      <td className="px-6 py-4">{vehicle.speed_kph ? Math.round(vehicle.speed_kph) : 0} kph</td>
                      <td className="px-6 py-4 text-xs">{vehicle.last_seen ? formatRelativeTime(vehicle.last_seen) : 'Never'}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-urja-text-muted">
                    No vehicles found matching criteria.
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
