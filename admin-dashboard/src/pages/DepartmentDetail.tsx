import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDepartments, updateDepartment } from '../api/departments';
import { getVehicles } from '../api/vehicles';
import { getAlerts } from '../api/alerts';
import { QUERY_KEYS } from '../utils/constants';
import { formatRelativeTime, formatDate, getVehicleStatus } from '../utils/formatters';
import { VehicleTypeLabels } from '../types/enums';
import PageHeader from '../components/common/PageHeader';
import StatusBadge from '../components/common/StatusBadge';
import MetricCard from '../components/common/MetricCard';
import { EmptyState, ErrorState } from '../components/common/FeedbackStates';

export default function DepartmentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', code: '', description: '', is_active: true });

  const { data: departments = [], isLoading: isLoadingDepts, isError, refetch } = useQuery({
    queryKey: [QUERY_KEYS.DEPARTMENTS],
    queryFn: () => getDepartments(100, 0),
  });

  const department = departments.find((d) => d.id === id);

  const { data: allVehicles = [], isLoading: isLoadingVehicles } = useQuery({
    queryKey: [QUERY_KEYS.VEHICLES],
    queryFn: () => getVehicles(1000, 0),
  });

  const deptVehicles = allVehicles.filter((v) => v.department_id === id);
  const vehicleIds = deptVehicles.map((v) => v.id);

  const { data: allAlerts = [], isLoading: isLoadingAlerts } = useQuery({
    queryKey: [QUERY_KEYS.ALERTS],
    queryFn: () => getAlerts(undefined, 500, 0),
  });

  const deptAlerts = allAlerts.filter((a) => vehicleIds.includes(a.vehicle_id));

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

  if (isLoadingDepts) {
    return (
      <div className="py-12 text-center text-xs font-semibold text-slate-500">
        Loading department details...
      </div>
    );
  }

  if (isError || !department) {
    return (
      <ErrorState
        title="Department Record Unavailable"
        message="Could not locate specified administrative department record."
        onRetry={refetch}
      />
    );
  }

  const activeVehicles = deptVehicles.filter((v) => getVehicleStatus(v) === 'active').length;
  const chargingVehicles = deptVehicles.filter((v) => v.charging === true).length;
  const offlineVehicles = deptVehicles.filter((v) => getVehicleStatus(v) === 'offline').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Division: ${department.name}`}
        subtitle={`Code: ${department.code} • Created ${formatDate(department.created_at)}`}
        badgeText={department.is_active ? 'ACTIVE DIVISION' : 'INACTIVE'}
        actions={
          <div className="flex items-center gap-2">
            <Link to="/departments" className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Back
            </Link>
            <button
              onClick={handleEditOpen}
              className="yatra-btn-primary"
            >
              <span className="material-symbols-outlined text-sm">edit</span>
              Edit Division
            </button>
          </div>
        }
      />

      {/* Overview Card */}
      <div className="yatra-card p-6 space-y-3">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Division Scope</h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          {department.description || 'Rajasthan state operational transit division.'}
        </p>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Division Fleet"
          value={deptVehicles.length}
          subtitle="Assigned EVs"
          icon="directions_bus"
          accentColor="teal"
        />
        <MetricCard
          title="Active EVs"
          value={activeVehicles}
          subtitle="In Transit"
          icon="electric_bolt"
          accentColor="teal"
        />
        <MetricCard
          title="Charging EVs"
          value={chargingVehicles}
          subtitle="At Station"
          icon="ev_station"
          accentColor="blue"
        />
        <MetricCard
          title="Offline EVs"
          value={offlineVehicles}
          subtitle="No Signal"
          icon="wifi_off"
          accentColor="slate"
        />
      </div>

      {/* Split Grids: Division Vehicles & Recent Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vehicles */}
        <div className="yatra-card p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Division Vehicle Roster ({deptVehicles.length})
            </h3>
          </div>

          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-3">Code</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-800">
                {deptVehicles.map((v) => (
                  <tr
                    key={v.id}
                    onClick={() => navigate(`/vehicles/${v.id}`)}
                    className="hover:bg-teal-50/50 cursor-pointer transition-colors"
                  >
                    <td className="py-2.5 px-3 font-bold text-slate-900">{v.vehicle_code}</td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {VehicleTypeLabels[v.vehicle_type] || v.vehicle_type}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <StatusBadge status={getVehicleStatus(v)} size="sm" />
                    </td>
                  </tr>
                ))}
                {deptVehicles.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-slate-400">
                      No vehicles assigned to this department.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Division Alerts */}
        <div className="yatra-card p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Recent Division Incidents ({deptAlerts.length})
            </h3>
          </div>

          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-3">Severity</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-800">
                {deptAlerts.slice(0, 10).map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3">
                      <StatusBadge status={a.severity} size="sm" />
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{a.alert_type}</td>
                    <td className="py-2.5 px-3 text-right text-slate-500 text-[11px]">
                      {formatRelativeTime(a.created_at)}
                    </td>
                  </tr>
                ))}
                {deptAlerts.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-slate-400">
                      No recent alerts recorded for this department.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Edit Department Details
              </h3>
              <button
                onClick={() => setEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Department Name
                  </label>
                  <input
                    required
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full h-10 px-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Code
                  </label>
                  <input
                    required
                    type="text"
                    value={editForm.code}
                    onChange={(e) => setEditForm({ ...editForm, code: e.target.value.toUpperCase() })}
                    className="w-full h-10 px-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 font-mono uppercase focus:outline-none focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Description
                  </label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className="w-full p-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-teal-600 min-h-[80px]"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={editForm.is_active}
                    onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500/20"
                  />
                  <label htmlFor="isActive" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Division is Active
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 p-4 border-t border-slate-100 bg-slate-50">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="yatra-btn-primary text-xs"
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
