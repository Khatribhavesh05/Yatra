import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsers, inviteUser, updateUserStatus } from '../api/users';
import { getDepartments } from '../api/departments';
import { UserRoleLabels } from '../types/enums';
import { formatRelativeTime, formatDate } from '../utils/formatters';
import { QUERY_KEYS } from '../utils/constants';
import PageHeader from '../components/common/PageHeader';
import StatusBadge from '../components/common/StatusBadge';
import { FilterSelect } from '../components/common/FilterControls';
import { EmptyState, ErrorState } from '../components/common/FeedbackStates';

export default function Users() {
  const queryClient = useQueryClient();
  const [deptFilter, setDeptFilter] = useState<string>('ALL');
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [statusReason, setStatusReason] = useState('');

  const [inviteForm, setInviteForm] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'DEPARTMENT_MEMBER',
    department_id: '',
  });

  const { data: users = [], isLoading: isLoadingUsers, isError, refetch } = useQuery({
    queryKey: [QUERY_KEYS.USERS, deptFilter !== 'ALL' ? deptFilter : undefined],
    queryFn: () => getUsers(deptFilter !== 'ALL' ? deptFilter : undefined, 100, 0),
  });

  const { data: departments = [], isLoading: isLoadingDepts } = useQuery({
    queryKey: [QUERY_KEYS.DEPARTMENTS],
    queryFn: () => getDepartments(100, 0),
  });

  const inviteMutation = useMutation({
    mutationFn: (data: any) => inviteUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USERS] });
      setInviteModalOpen(false);
      setInviteForm({
        email: '',
        password: '',
        full_name: '',
        role: 'DEPARTMENT_MEMBER',
        department_id: '',
      });
    },
  });

  const statusMutation = useMutation({
    mutationFn: (data: { id: string; is_active: boolean; reason: string }) =>
      updateUserStatus(data.id, { is_active: data.is_active, reason: data.reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USERS] });
      setStatusModalOpen(false);
    },
  });

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { department_id, ...rest } = inviteForm;
    const dataToSubmit = department_id ? inviteForm : rest;
    inviteMutation.mutate(dataToSubmit);
  };

  const handleStatusToggle = (user: any) => {
    setSelectedUser(user);
    setStatusReason('');
    setStatusModalOpen(true);
  };

  const confirmStatusToggle = () => {
    if (selectedUser) {
      statusMutation.mutate({
        id: selectedUser.id,
        is_active: !selectedUser.is_active,
        reason: statusReason,
      });
    }
  };

  const getDeptName = (id: string | null | undefined) => {
    if (!id) return 'System-Wide';
    const dept = departments.find((d: any) => d.id === id);
    return dept ? dept.name : id;
  };

  if (isError) {
    return (
      <ErrorState
        title="Failed to Load Access Registry"
        message="Could not load system user accounts or permission roles."
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Government Access Control Registry"
        subtitle="Manage state transport officers, department administrators, and platform credentials."
        badgeText="ACCESS REGISTRY"
        actions={
          <button
            onClick={() => setInviteModalOpen(true)}
            className="yatra-btn-primary"
          >
            <span className="material-symbols-outlined text-base">person_add</span>
            Invite Officer Account
          </button>
        }
      />

      {/* Toolbar */}
      <div className="yatra-card p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Department Scope:</span>
          <FilterSelect
            value={deptFilter}
            onChange={setDeptFilter}
            placeholder="All Departments"
            options={departments.map((d: any) => ({ value: d.id, label: d.name }))}
            className="w-56"
          />
        </div>

        <div className="text-xs font-semibold text-slate-500">
          Total Users: <span className="font-bold text-slate-900">{users.length}</span>
        </div>
      </div>

      {/* Registry Table */}
      <div className="yatra-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Officer Name</th>
                <th className="py-3 px-4">Official Email</th>
                <th className="py-3 px-4">System Role</th>
                <th className="py-3 px-4">Department Scope</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4">Last Active</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-800 font-medium">
              {isLoadingUsers || isLoadingDepts ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={7} className="py-4 px-4 bg-slate-50/50" />
                  </tr>
                ))
              ) : users.length > 0 ? (
                users.map((user: any) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{user.full_name || '—'}</td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">{user.email}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded font-semibold text-[11px] uppercase tracking-wider">
                        {UserRoleLabels[user.role as keyof typeof UserRoleLabels] || user.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">{getDeptName(user.department_id)}</td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={user.is_active ? 'active' : 'inactive'} />
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      {user.last_login_at ? formatRelativeTime(user.last_login_at) : 'Never'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleStatusToggle(user)}
                        className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                          user.is_active
                            ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                            : 'bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200'
                        }`}
                      >
                        {user.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8">
                    <EmptyState
                      title="No Users Registered"
                      description="No user accounts match the selected department filter."
                      icon="group"
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      {inviteModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Provision Officer Account
              </h3>
              <button
                onClick={() => setInviteModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <form onSubmit={handleInviteSubmit}>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Official Email
                  </label>
                  <input
                    required
                    type="email"
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                    className="w-full h-10 px-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-teal-600"
                    placeholder="officer@yatra.gov.in"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Temporary Password
                  </label>
                  <input
                    required
                    type="password"
                    value={inviteForm.password}
                    onChange={(e) => setInviteForm({ ...inviteForm, password: e.target.value })}
                    className="w-full h-10 px-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-teal-600"
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Officer Full Name
                  </label>
                  <input
                    type="text"
                    value={inviteForm.full_name}
                    onChange={(e) => setInviteForm({ ...inviteForm, full_name: e.target.value })}
                    className="w-full h-10 px-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-teal-600"
                    placeholder="Officer Name"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Access Role
                  </label>
                  <select
                    value={inviteForm.role}
                    onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                    className="w-full h-10 px-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-teal-600"
                  >
                    {Object.entries(UserRoleLabels).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Department Assignment
                  </label>
                  <select
                    value={inviteForm.department_id}
                    onChange={(e) => setInviteForm({ ...inviteForm, department_id: e.target.value })}
                    className="w-full h-10 px-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-teal-600"
                  >
                    <option value="">System-Wide / Platform Admin</option>
                    {departments.map((dept: any) => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 p-4 border-t border-slate-100 bg-slate-50">
                <button
                  type="button"
                  onClick={() => setInviteModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inviteMutation.isPending}
                  className="yatra-btn-primary text-xs"
                >
                  {inviteMutation.isPending ? 'Provisioning...' : 'Provision Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Status Modal */}
      {statusModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-xl shadow-2xl w-full max-w-md overflow-hidden p-5">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
              {selectedUser.is_active ? 'Deactivate Officer Account' : 'Activate Officer Account'}
            </h3>
            <p className="text-xs text-slate-600 mb-4">
              Are you sure you want to change access status for <span className="font-bold text-slate-900">{selectedUser.email}</span>?
            </p>

            <input
              type="text"
              value={statusReason}
              onChange={(e) => setStatusReason(e.target.value)}
              className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-teal-600 mb-4"
              placeholder="Reason for status change..."
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setStatusModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmStatusToggle}
                disabled={statusMutation.isPending}
                className={`px-4 py-2 text-xs font-bold rounded-lg text-white transition-colors ${
                  selectedUser.is_active ? 'bg-rose-600 hover:bg-rose-700' : 'bg-teal-700 hover:bg-teal-800'
                }`}
              >
                {statusMutation.isPending ? 'Saving...' : 'Confirm Status Change'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
