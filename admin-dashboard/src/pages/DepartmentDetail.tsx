import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDepartments, updateDepartment } from '../api/departments';
import { getVehicles } from '../api/vehicles';
import { getAlerts } from '../api/alerts';
import { QUERY_KEYS } from '../utils/constants';
import { formatRelativeTime, formatDate } from '../utils/formatters';
import { getVehicleStatus } from '../utils/formatters';
import { VehicleTypeLabels } from '../types/enums';
import { ChevronRight, Edit2, Car, Activity, Zap, AlertTriangle, CheckCircle, X } from 'lucide-react';

export default function DepartmentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', code: '', description: '', is_active: true });

  const { data: departments = [], isLoading: isLoadingDepts } = useQuery({
    queryKey: [QUERY_KEYS.DEPARTMENTS],
    queryFn: () => getDepartments(100, 0),
  });

  const department = departments.find(d => d.id === id);

  const { data: allVehicles = [], isLoading: isLoadingVehicles } = useQuery({
    queryKey: [QUERY_KEYS.VEHICLES],
    queryFn: () => getVehicles(1000, 0),
  });

  const deptVehicles = allVehicles.filter(v => v.department_id === id);
  const vehicleIds = deptVehicles.map(v => v.id);

  const { data: allAlerts = [], isLoading: isLoadingAlerts } = useQuery({
    queryKey: [QUERY_KEYS.ALERTS],
    queryFn: () => getAlerts(undefined, 500, 0),
  });

  const deptAlerts = allAlerts.filter(a => vehicleIds.includes(a.vehicle_id));

  const updateMutation = useMutation({
    mutationFn: (data: any) => updateDepartment(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DEPARTMENTS] });
      setEditModalOpen(false);
    },
  });

  const handleEditOpen = () => {
    if (department) {
      setEditForm({
        name: department.name,
        code: department.code,
        description: department.description || '',
        is_active: department.is_active,
      });
      setEditModalOpen(true);
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(editForm);
  };

  if (isLoadingDepts) return <div className="text-urja-text-secondary p-8">Loading department...</div>;
  if (!department) return <div className="text-urja-danger p-8">Department not found.</div>;

  const activeVehicles = deptVehicles.filter(v => {
    const status = getVehicleStatus(v);
    return status === 'active';
  }).length;
  const chargingVehicles = deptVehicles.filter(v => v.charging === true).length;
  const offlineVehicles = deptVehicles.filter(v => {
    const status = getVehicleStatus(v);
    return status === 'offline';
  }).length;

  return (
    <div className="space-y-6">
      <nav className="flex items-center text-sm text-urja-text-secondary gap-2">
        <Link to="/departments" className="hover:text-urja-text transition-colors">Departments</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-urja-text">{department.name}</span>
      </nav>

      <div className="bg-urja-surface border border-urja-border rounded-2xl shadow-sm hover:shadow hover:border-urja-green-border hover:-translate-y-1 transition-all duration-200 p-6">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-urja-text">{department.name}</h1>
              <span className="px-2.5 py-1 bg-urja-pale text-urja-text-secondary text-sm rounded-md font-mono">
                {department.code}
              </span>
              <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                department.is_active ? 'bg-urja-success/10 text-urja-success border border-urja-success/20' : 'bg-urja-danger/10 text-urja-danger border border-urja-danger/20'
              }`}>
                {department.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p className="text-urja-text-secondary max-w-3xl mt-2">{department.description || 'No description provided.'}</p>
            <div className="text-sm text-urja-text-muted mt-4 flex gap-4">
              <span>Created {formatDate(department.created_at)}</span>
              <span>Updated {formatRelativeTime(department.updated_at)}</span>
            </div>
          </div>
          <button
            onClick={handleEditOpen}
            className="p-2 bg-urja-pale hover:bg-slate-700 text-urja-text-secondary rounded-lg transition-colors flex items-center gap-2"
          >
            <Edit2 className="w-4 h-4" />
            <span className="text-sm font-medium pr-1">Edit</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-urja-surface border border-urja-border p-5 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-urja-info/10 text-urja-info rounded-lg"><Car className="w-6 h-6" /></div>
          <div>
            <p className="text-sm text-urja-text-secondary font-medium">Total Vehicles</p>
            <p className="text-2xl font-bold text-urja-text">{deptVehicles.length}</p>
          </div>
        </div>
        <div className="bg-urja-surface border border-urja-border p-5 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-urja-success/10 text-urja-success rounded-lg"><CheckCircle className="w-6 h-6" /></div>
          <div>
            <p className="text-sm text-urja-text-secondary font-medium">Active</p>
            <p className="text-2xl font-bold text-urja-text">{activeVehicles}</p>
          </div>
        </div>
        <div className="bg-urja-surface border border-urja-border p-5 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-yellow-500/10 text-yellow-500 rounded-lg"><Zap className="w-6 h-6" /></div>
          <div>
            <p className="text-sm text-urja-text-secondary font-medium">Charging</p>
            <p className="text-2xl font-bold text-urja-text">{chargingVehicles}</p>
          </div>
        </div>
        <div className="bg-urja-surface border border-urja-border p-5 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-urja-pale text-urja-text-secondary rounded-lg"><Activity className="w-6 h-6" /></div>
          <div>
            <p className="text-sm text-urja-text-secondary font-medium">Offline</p>
            <p className="text-2xl font-bold text-urja-text">{offlineVehicles}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-urja-surface border border-urja-border rounded-2xl shadow-sm hover:shadow hover:border-urja-green-border hover:-translate-y-1 transition-all duration-200 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-urja-border bg-urja-pale/20">
            <h2 className="text-lg font-semibold text-urja-text flex items-center gap-2">
              <Car className="w-5 h-5 text-urja-text-secondary" />
              Department Vehicles
            </h2>
          </div>
          <div className="overflow-y-auto max-h-[400px]">
            {isLoadingVehicles ? (
              <div className="p-8 text-center text-urja-text-muted">Loading vehicles...</div>
            ) : deptVehicles.length === 0 ? (
              <div className="p-8 text-center text-urja-text-muted">No vehicles assigned to this department.</div>
            ) : (
              <table className="w-full text-left text-sm text-urja-text-secondary">
                <thead className="bg-urja-pale sticky top-0 text-urja-text-secondary">
                  <tr>
                    <th className="p-3 font-medium">Vehicle Code</th>
                    <th className="p-3 font-medium">Type</th>
                    <th className="p-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-urja-border">
                  {deptVehicles.map(v => (
                    <tr key={v.id} onClick={() => navigate(`/vehicles/${v.id}`)} className="hover:bg-urja-pale/30 cursor-pointer transition-colors">
                      <td className="p-3 font-mono text-xs">{v.vehicle_code}</td>
                      <td className="p-3">{VehicleTypeLabels[v.vehicle_type] || v.vehicle_type}</td>
                      <td className="p-3">
                        <span className="text-xs px-2 py-1 rounded bg-urja-pale text-urja-text-secondary">{getVehicleStatus(v)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="bg-urja-surface border border-urja-border rounded-2xl shadow-sm hover:shadow hover:border-urja-green-border hover:-translate-y-1 transition-all duration-200 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-urja-border bg-urja-pale/20">
            <h2 className="text-lg font-semibold text-urja-text flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-urja-text-secondary" />
              Recent Alerts
            </h2>
          </div>
          <div className="overflow-y-auto max-h-[400px]">
            {isLoadingAlerts ? (
              <div className="p-8 text-center text-urja-text-muted">Loading alerts...</div>
            ) : deptAlerts.length === 0 ? (
              <div className="p-8 text-center text-urja-text-muted">No alerts for vehicles in this department.</div>
            ) : (
              <table className="w-full text-left text-sm text-urja-text-secondary">
                <thead className="bg-urja-pale sticky top-0 text-urja-text-secondary">
                  <tr>
                    <th className="p-3 font-medium">Severity</th>
                    <th className="p-3 font-medium">Type</th>
                    <th className="p-3 font-medium">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-urja-border">
                  {deptAlerts.slice(0, 10).map(a => (
                    <tr key={a.id} className="hover:bg-urja-pale/30 transition-colors">
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                          a.severity === 'CRITICAL' ? 'bg-red-600 text-white' : 
                          a.severity === 'HIGH' ? 'bg-orange-500 text-white' : 'bg-slate-700 text-urja-text'
                        }`}>
                          {a.severity}
                        </span>
                      </td>
                      <td className="p-3 text-xs">{a.alert_type}</td>
                      <td className="p-3 text-xs text-urja-text-secondary">{formatRelativeTime(a.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {editModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-urja-surface border border-urja-border rounded-2xl shadow-sm hover:shadow hover:border-urja-green-border hover:-translate-y-1 transition-all duration-200 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-urja-border">
              <h2 className="text-xl font-semibold text-urja-text">Edit Department</h2>
              <button onClick={() => setEditModalOpen(false)} className="text-urja-text-secondary hover:text-urja-text">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-urja-text-secondary mb-1">Name</label>
                  <input
                    required
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    className="w-full bg-urja-pale border border-urja-green-border rounded-lg px-4 py-2.5 text-urja-text focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-urja-text-secondary mb-1">Code</label>
                  <input
                    required
                    type="text"
                    value={editForm.code}
                    onChange={(e) => setEditForm({...editForm, code: e.target.value})}
                    className="w-full bg-urja-pale border border-urja-green-border rounded-lg px-4 py-2.5 text-urja-text focus:outline-none focus:ring-2 focus:ring-emerald-500 uppercase"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-urja-text-secondary mb-1">Description</label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                    className="w-full bg-urja-pale border border-urja-green-border rounded-lg px-4 py-2.5 text-urja-text focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[100px]"
                  />
                </div>
                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-urja-border">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={editForm.is_active}
                    onChange={(e) => setEditForm({...editForm, is_active: e.target.checked})}
                    className="w-4 h-4 rounded border-urja-green-border bg-urja-pale text-urja-success focus:ring-emerald-500/20"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-urja-text-secondary">
                    Department is active
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-3 p-6 border-t border-urja-border bg-urja-surface/50 rounded-b-2xl">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-urja-text-secondary hover:text-urja-text transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="px-4 py-2 bg-urja-primary hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
