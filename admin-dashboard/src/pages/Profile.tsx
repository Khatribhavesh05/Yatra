import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { UserRoleLabels } from '../types/enums';
import PageHeader from '../components/common/PageHeader';
import StatusBadge from '../components/common/StatusBadge';
import { DetailPanel, InfoRow } from '../components/common/DetailComponents';

export default function Profile() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        title="Officer Account Profile"
        subtitle="Credentials, assigned department scope, and security permissions."
        badgeText="OFFICER PROFILE"
        actions={
          <button
            onClick={logout}
            className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base">logout</span>
            Sign Out
          </button>
        }
      />

      {/* Account Dossier Card */}
      <div className="yatra-card p-6 flex items-center gap-5">
        <div className="h-16 w-16 rounded-xl bg-teal-700 text-white text-2xl font-extrabold flex items-center justify-center shadow-md shrink-0">
          {user.full_name?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div className="space-y-1 flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-extrabold text-slate-900">{user.full_name}</h2>
            <StatusBadge status={user.is_active ? 'active' : 'inactive'} />
          </div>
          <p className="text-xs text-slate-500 font-medium font-mono">{user.email}</p>
          <span className="inline-block text-[11px] font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded uppercase tracking-wider">
            {UserRoleLabels[user.role as keyof typeof UserRoleLabels] || user.role}
          </span>
        </div>
      </div>

      {/* Detail Panels */}
      <DetailPanel title="Credentials & Security Scope" icon="shield">
        <InfoRow label="Officer Full Name" value={user.full_name} />
        <InfoRow label="Official Email" value={<span className="font-mono text-slate-900">{user.email}</span>} />
        <InfoRow
          label="Assigned System Role"
          value={<span className="font-bold text-slate-900">{UserRoleLabels[user.role as keyof typeof UserRoleLabels] || user.role}</span>}
        />
        <InfoRow label="Assigned Department Scope" value={user.department_name || 'System-Wide / All Divisions'} />
        <InfoRow label="Account Security Status" value={<StatusBadge status={user.is_active ? 'active' : 'inactive'} />} border={false} />
      </DetailPanel>
    </div>
  );
}
