import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsers, inviteUser, updateUserStatus } from '../api/users';
import { getDepartments } from '../api/departments';
import { UserRoleLabels } from '../types/enums';
import { formatRelativeTime, formatDate } from '../utils/formatters';
import { QUERY_KEYS } from '../utils/constants';
import { Users as UsersIcon, UserPlus, Mail, Shield, Building, ToggleLeft, ToggleRight, X } from 'lucide-react';

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

  const { data: users = [], isLoading: isLoadingUsers } = useQuery({
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
        email: '', password: '', full_name: '', role: 'DEPARTMENT_MEMBER', department_id: ''
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
    if (!id) return 'None';
    const dept = departments.find((d: any) => d.id === id);
    return dept ? dept.name : id;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-urja-text">Users & Roles</h1>
          <p className="text-urja-text-secondary mt-1">Manage system access and permissions.</p>
        </div>
        <button
          onClick={() => setInviteModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-urja-primary hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Invite User
        </button>
      </div>

      <div className="bg-urja-surface border border-urja-border rounded-2xl shadow-sm hover:shadow hover:border-urja-green-border hover:-translate-y-1 transition-all duration-200 p-4 flex gap-4 items-center">
        <label className="text-sm text-urja-text-secondary font-medium">Filter by Department:</label>
        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="bg-urja-pale border border-urja-green-border text-urja-text rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="ALL">All Departments</option>
          {departments.map((dept: any) => (
            <option key={dept.id} value={dept.id}>{dept.name}</option>
          ))}
        </select>
      </div>

      <div className="bg-urja-surface border border-urja-border rounded-2xl shadow-sm hover:shadow hover:border-urja-green-border hover:-translate-y-1 transition-all duration-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-urja-pale border-b border-urja-green-border/50 text-urja-text-secondary text-xs uppercase tracking-wider">
              <tr>
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Email</th>
                <th className="p-4 font-medium">Role</th>
                <th className="p-4 font-medium">Department</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Last Login</th>
                <th className="p-4 font-medium">Created</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-sm text-urja-text-secondary">
              {isLoadingUsers || isLoadingDepts ? (
                <tr><td colSpan={8} className="p-8 text-center text-urja-text-muted">Loading users...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={8} className="p-8 text-center text-urja-text-muted">No users found.</td></tr>
              ) : (
                users.map((user: any) => (
                  <tr key={user.id} className="hover:bg-urja-pale/30 transition-colors">
                    <td className="p-4 font-medium text-urja-text">{user.full_name || '—'}</td>
                    <td className="p-4 text-urja-text-secondary">{user.email}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 bg-urja-pale text-urja-text-secondary text-xs rounded-md">
                        {UserRoleLabels[user.role as keyof typeof UserRoleLabels] || user.role}
                      </span>
                    </td>
                    <td className="p-4 text-urja-text-secondary">{getDeptName(user.department_id ?? undefined)}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.is_active ? 'bg-urja-success/10 text-urja-success' : 'bg-urja-danger/10 text-urja-danger'
                      }`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4 text-urja-text-secondary">{user.last_login_at ? formatRelativeTime(user.last_login_at) : 'Never'}</td>
                    <td className="p-4 text-urja-text-secondary">{formatDate(user.created_at)}</td>
                    <td className="p-4">
                      <button
                        onClick={() => handleStatusToggle(user)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          user.is_active ? 'text-urja-text-secondary hover:text-urja-danger hover:bg-red-400/10' : 'text-urja-text-secondary hover:text-urja-primary hover:bg-emerald-400/10'
                        }`}
                        title={user.is_active ? "Deactivate User" : "Activate User"}
                      >
                        {user.is_active ? <ToggleRight className="w-5 h-5 text-urja-success" /> : <ToggleLeft className="w-5 h-5" />}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {inviteModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-urja-surface border border-urja-border rounded-2xl shadow-sm hover:shadow hover:border-urja-green-border hover:-translate-y-1 transition-all duration-200 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-urja-border">
              <h2 className="text-xl font-semibold text-urja-text flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-urja-success" />
                Invite New User
              </h2>
              <button onClick={() => setInviteModalOpen(false)} className="text-urja-text-secondary hover:text-urja-text">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleInviteSubmit}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-urja-text-secondary mb-1">Email Address</label>
                  <input
                    required type="email" value={inviteForm.email}
                    onChange={(e) => setInviteForm({...inviteForm, email: e.target.value})}
                    className="w-full bg-urja-pale border border-urja-green-border rounded-lg px-4 py-2 text-urja-text focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-urja-text-secondary mb-1">Temporary Password</label>
                  <input
                    required type="password" value={inviteForm.password}
                    onChange={(e) => setInviteForm({...inviteForm, password: e.target.value})}
                    className="w-full bg-urja-pale border border-urja-green-border rounded-lg px-4 py-2 text-urja-text focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-urja-text-secondary mb-1">Full Name</label>
                  <input
                    type="text" value={inviteForm.full_name}
                    onChange={(e) => setInviteForm({...inviteForm, full_name: e.target.value})}
                    className="w-full bg-urja-pale border border-urja-green-border rounded-lg px-4 py-2 text-urja-text focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-urja-text-secondary mb-1">Role</label>
                  <select
                    value={inviteForm.role}
                    onChange={(e) => setInviteForm({...inviteForm, role: e.target.value})}
                    className="w-full bg-urja-pale border border-urja-green-border rounded-lg px-4 py-2 text-urja-text focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {Object.entries(UserRoleLabels).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-urja-text-secondary mb-1">Department</label>
                  <select
                    value={inviteForm.department_id}
                    onChange={(e) => setInviteForm({...inviteForm, department_id: e.target.value})}
                    className="w-full bg-urja-pale border border-urja-green-border rounded-lg px-4 py-2 text-urja-text focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">None / System Wide</option>
                    {departments.map((dept: any) => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 p-6 border-t border-urja-border bg-urja-surface/50">
                <button type="button" onClick={() => setInviteModalOpen(false)} className="px-4 py-2 text-sm font-medium text-urja-text-secondary">Cancel</button>
                <button type="submit" disabled={inviteMutation.isPending} className="px-4 py-2 bg-urja-primary hover:bg-emerald-500 text-white rounded-lg text-sm font-medium disabled:opacity-50">
                  {inviteMutation.isPending ? 'Sending...' : 'Send Invite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {statusModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-urja-surface border border-urja-border rounded-2xl shadow-sm hover:shadow hover:border-urja-green-border hover:-translate-y-1 transition-all duration-200 w-full max-w-md shadow-2xl p-6">
            <h2 className="text-xl font-semibold text-urja-text mb-2">
              {selectedUser.is_active ? 'Deactivate User' : 'Activate User'}
            </h2>
            <p className="text-urja-text-secondary mb-4 text-sm">
              Are you sure you want to {selectedUser.is_active ? 'deactivate' : 'activate'} <span className="font-medium text-urja-text">{selectedUser.email}</span>?
            </p>
            <div className="mb-6">
              <label className="block text-sm font-medium text-urja-text-secondary mb-1">Reason (Optional)</label>
              <input
                type="text"
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
                className="w-full bg-urja-pale border border-urja-green-border rounded-lg px-4 py-2 text-urja-text focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Brief reason for status change"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setStatusModalOpen(false)} className="px-4 py-2 text-sm font-medium text-urja-text-secondary">Cancel</button>
              <button 
                onClick={confirmStatusToggle} 
                disabled={statusMutation.isPending} 
                className={`px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50 ${selectedUser.is_active ? 'bg-red-600 hover:bg-red-500' : 'bg-urja-primary hover:bg-emerald-500'}`}
              >
                {statusMutation.isPending ? 'Saving...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
