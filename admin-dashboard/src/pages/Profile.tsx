import { useAuth } from '../hooks/useAuth';
import { UserRoleLabels } from '../types/enums';
import { UserCircle, Mail, Shield, Building2, LogOut } from 'lucide-react';

export default function Profile() {
  const { user, logout } = useAuth();

  if (!user) return null;

  const infoItems = [
    { icon: Mail, label: 'Email', value: user.email },
    { icon: Shield, label: 'Role', value: UserRoleLabels[user.role] || user.role },
    { icon: Building2, label: 'Department', value: user.department_name || 'Platform-wide (No Department)' },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-xl font-bold text-urja-text">Profile</h1>

      <div className="bg-urja-surface border border-urja-border rounded-2xl shadow-sm hover:shadow hover:border-urja-green-border hover:-translate-y-1 transition-all duration-200 p-6">
        {/* Avatar + Name */}
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-urja-border">
          <div className="h-16 w-16 rounded-full bg-urja-pale border border-urja-green-border flex items-center justify-center">
            <UserCircle className="h-10 w-10 text-urja-text-muted" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-urja-text">{user.full_name}</h2>
            <p className="text-sm text-urja-text-secondary">{UserRoleLabels[user.role] || user.role}</p>
          </div>
          <div className="ml-auto">
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
              user.is_active
                ? 'bg-urja-success/10 text-urja-primary border border-urja-success/20'
                : 'bg-urja-danger/10 text-urja-danger border border-urja-danger/20'
            }`}>
              {user.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        {/* Info rows */}
        <div className="space-y-4">
          {infoItems.map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-urja-pale flex items-center justify-center shrink-0">
                <item.icon className="h-4 w-4 text-urja-text-muted" />
              </div>
              <div>
                <div className="text-[11px] text-urja-text-muted uppercase font-medium tracking-wider">{item.label}</div>
                <div className="text-sm text-urja-text">{item.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={logout}
        className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-urja-danger bg-urja-danger/10 border border-urja-danger/20 hover:bg-urja-danger/10 transition-colors"
      >
        <LogOut className="h-4 w-4" />
        Sign out
      </button>
    </div>
  );
}
