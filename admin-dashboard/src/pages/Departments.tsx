import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDepartments, createDepartment } from '../api/departments';
import { getVehicles } from '../api/vehicles';
import { QUERY_KEYS } from '../utils/constants';
import { Link } from 'react-router-dom';
import { getVehicleStatus } from '../utils/formatters';
import PageHeader from '../components/common/PageHeader';
import StatusBadge from '../components/common/StatusBadge';
import { EmptyState, ErrorState } from '../components/common/FeedbackStates';

export default function Departments() {
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', code: '', description: '' });

  const queryClient = useQueryClient();

  const { data: departments = [], isLoading: isLoadingDepts, isError, refetch } = useQuery({
    queryKey: [QUERY_KEYS.DEPARTMENTS],
    queryFn: () => getDepartments(100, 0),
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: [QUERY_KEYS.VEHICLES],
    queryFn: () => getVehicles(500, 0),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => createDepartment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DEPARTMENTS] });
      setModalOpen(false);
      setFormData({ name: '', code: '', description: '' });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const getDeptFleetStats = (deptId: string) => {
    const deptVehicles = vehicles.filter((v) => v.department_id === deptId);
    const active = deptVehicles.filter((v) => getVehicleStatus(v) === 'active').length;
    const charging = deptVehicles.filter((v) => getVehicleStatus(v) === 'charging').length;
    return { total: deptVehicles.length, active, charging };
  };

  if (isError) {
    return (
      <ErrorState
        title="Failed to Load Department Directory"
        message="Could not retrieve administrative department records."
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Administrative Department Directory"
        subtitle="Rajasthan state transit, municipal transport, and emergency service divisions."
        badgeText="DEPARTMENTS"
        actions={
          <button
            onClick={() => setModalOpen(true)}
            className="yatra-btn-primary"
          >
            <span className="material-symbols-outlined text-base">add</span>
            Add Department
          </button>
        }
      />

      {isLoadingDepts ? (
        <div className="py-12 text-center text-xs font-semibold text-slate-500">
          Loading department directory...
        </div>
      ) : departments.length === 0 ? (
        <EmptyState
          title="No Departments Configured"
          description="Click 'Add Department' to register state transit or municipal divisions."
          icon="domain"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept) => {
            const stats = getDeptFleetStats(dept.id);
            return (
              <Link key={dept.id} to={`/departments/${dept.id}`} className="group block">
                <div className="yatra-card p-5 hover:border-teal-500 hover:shadow-md transition-all space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-teal-700 transition-colors">
                        {dept.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded font-mono text-[11px] font-bold">
                          {dept.code}
                        </span>
                        <StatusBadge status={dept.is_active ? 'active' : 'inactive'} size="sm" />
                      </div>
                    </div>
                    <div className="p-2.5 bg-teal-50 text-teal-700 rounded-xl">
                      <span className="material-symbols-outlined text-xl">domain</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-2 h-8">
                    {dept.description || 'Rajasthan state operational division.'}
                  </p>

                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-center">
                    <div className="p-2 bg-slate-50 rounded-lg">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Total EVs</span>
                      <div className="text-sm font-extrabold text-slate-900 mt-0.5">{stats.total}</div>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-lg">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Active</span>
                      <div className="text-sm font-extrabold text-teal-700 mt-0.5">{stats.active}</div>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-lg">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Charging</span>
                      <div className="text-sm font-extrabold text-blue-700 mt-0.5">{stats.charging}</div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Create Department Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Create State Department Division
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Department Name
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full h-10 px-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-teal-600"
                    placeholder="e.g. Jaipur City Electric Transport"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Department Code
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full h-10 px-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 font-mono focus:outline-none focus:border-teal-600 uppercase"
                    placeholder="e.g. JCET-01"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Operational Scope & Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full p-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-teal-600 min-h-[80px]"
                    placeholder="Division scope and fleet responsibilities..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 p-4 border-t border-slate-100 bg-slate-50">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="yatra-btn-primary text-xs"
                >
                  {createMutation.isPending ? 'Saving...' : 'Register Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
