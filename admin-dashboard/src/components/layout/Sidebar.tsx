import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Map, Building2, Car, AlertTriangle,
  Zap, Users, Cpu, BarChart3, ScrollText, HeartPulse, ChevronLeft, ChevronRight, UserCircle,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { canAccess, isPlatformAdmin } from '../../utils/permissions';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Overview' },
  { to: '/live-fleet', icon: Map, label: 'Live Fleet' },
  { to: '/departments', icon: Building2, label: 'Departments' },
  { to: '/vehicles', icon: Car, label: 'Vehicles' },
  { to: '/alerts', icon: AlertTriangle, label: 'Alerts' },
  { to: '/charging', icon: Zap, label: 'Charging' },
  { to: '/users', icon: Users, label: 'Users & Roles' },
  { to: '/devices', icon: Cpu, label: 'Devices' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/audit-logs', icon: ScrollText, label: 'Audit Logs' },
  { to: '/system-health', icon: HeartPulse, label: 'System Health' },
  { to: '/profile', icon: UserCircle, label: 'Profile' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  const userRole = user?.role || '';
  const isAdmin = isPlatformAdmin(userRole);

  // Filter nav items based on role
  const visibleItems = navItems.filter((item) => canAccess(userRole, item.to));

  return (
    <aside
      className={`flex flex-col bg-urja-surface border-r border-urja-border transition-all duration-200 ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Logo / Context */}
      <div className="flex items-center gap-3 px-3.5 h-16 border-b border-urja-border">
        {collapsed ? (
          <div className="w-full flex justify-center">
            <img
              src="/urja-icon.svg"
              alt="URJA"
              className="h-8 w-8 object-contain"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/urja-icon.png';
              }}
            />
          </div>
        ) : (
          <div className="flex items-center justify-between w-full overflow-hidden">
            <img
              src="/urja-logo-darkmode.svg"
              alt="URJA Logo"
              className="h-9 w-auto object-contain"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/urja-logo-darkmode.png';
              }}
            />
            <div className="text-[10px] font-bold tracking-wider px-1.5 py-0.5 rounded bg-urja-primary/10 border border-urja-primary/20 shrink-0">
              {isAdmin ? (
                <span className="text-urja-primary">ADMIN</span>
              ) : (
                <span className="text-urja-info truncate block max-w-[80px]" title={user?.department_name || ''}>
                  {user?.department_name || 'DEPT'}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {visibleItems.map((item) => {
          const isActive =
            item.to === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.to);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? isAdmin ? 'bg-urja-light text-urja-primary' : 'bg-urja-info/10 text-urja-info'
                  : 'text-urja-text-secondary hover:bg-urja-pale hover:text-urja-text'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="h-4.5 w-4.5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center h-10 border-t border-urja-border text-urja-text-muted hover:text-urja-text-secondary transition-colors"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>
    </aside>
  );
}
