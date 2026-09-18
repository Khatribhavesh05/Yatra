import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDepartments, createDepartment } from '../api/departments';
import { getVehicles } from '../api/vehicles';
import { QUERY_KEYS } from '../utils/constants';
import { Building2, Plus, Users, Car, Activity, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Departments() {
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', code: '', description: '' });
  
  const queryClient = useQueryClient();

  const { data: departments = [], isLoading: isLoadingDepts } = useQuery({
    queryKey: [QUERY_KEYS.DEPARTMENTS],
    queryFn: () => getDepartments(100, 0),
  });

  const { data: vehicles = [], isLoading: isLoadingVehicles } = useQuery({
    queryKey: [QUERY_KEYS.VEHICLES],
    queryFn: () => getVehicles(1000, 0),
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

  const getVehicleCount = (deptId: string) => {
    return vehicles.filter(v => v.department_id === deptId).length;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-urja-text">Departments</h1>
          <p className="text-urja-text-secondary mt-1">Manage organizational units and groups.</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-urja-primary hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create Department
        </button>
      </div>

      {isLoadingDepts || isLoadingVehicles ? (
        <div className="text-center py-12 text-urja-text-muted">Loading departments...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map(dept => (
            <Link key={dept.id} to={`/departments/${dept.id}`} className="group block">
              <div className="bg-urja-surface border border-urja-border hover:border-urja-primary/50 rounded-2xl p-6 transition-all duration-200">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-urja-text group-hover:text-urja-primary transition-colors">
                      {dept.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 bg-urja-pale text-urja-text-secondary text-xs rounded-md font-mono">
                        {dept.code}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-urja-text-secondary">
                        <span className={`w-2 h-2 rounded-full ${dept.is_active ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                        {dept.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  <div className="p-2 bg-urja-pale rounded-lg text-urja-text-secondary">
                    <Building2 className="w-5 h-5" />
                  </div>
                </div>
                
                <p className="text-sm text-urja-text-secondary line-clamp-2 mb-6 h-10">
                  {dept.description || 'No description provided.'}
                </p>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-urja-border">
                  <div className="flex flex-col">
                    <span className="text-xs text-urja-text-muted flex items-center gap-1"><Car className="w-3 h-3" /> Vehicles</span>
                    <span className="text-lg font-semibold text-urja-text mt-1">{getVehicleCount(dept.id)}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-urja-text-muted flex items-center gap-1"><Users className="w-3 h-3" /> Users</span>
                    <span className="text-lg font-semibold text-urja-text mt-1">N/A</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-urja-surface border border-urja-border rounded-2xl shadow-sm hover:shadow hover:border-urja-green-border hover:-translate-y-1 transition-all duration-200 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-urja-border">
              <h2 className="text-xl font-semibold text-urja-text">Create Department</h2>
              <button onClick={() => setModalOpen(false)} className="text-urja-text-secondary hover:text-urja-text">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-urja-text-secondary mb-1">Name</label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-urja-pale border border-urja-green-border rounded-lg px-4 py-2.5 text-urja-text focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="e.g. West Coast Operations"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-urja-text-secondary mb-1">Code</label>
                  <input
                    required
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value})}
                    className="w-full bg-urja-pale border border-urja-green-border rounded-lg px-4 py-2.5 text-urja-text focus:outline-none focus:ring-2 focus:ring-emerald-500 uppercase"
                    placeholder="e.g. WCO-01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-urja-text-secondary mb-1">Description (Optional)</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full bg-urja-pale border border-urja-green-border rounded-lg px-4 py-2.5 text-urja-text focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[100px]"
                    placeholder="Department description..."
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 p-6 border-t border-urja-border bg-urja-surface/50 rounded-b-2xl">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-urja-text-secondary hover:text-urja-text transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-4 py-2 bg-urja-primary hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {createMutation.isPending ? 'Creating...' : 'Create Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
