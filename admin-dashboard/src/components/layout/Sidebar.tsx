import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Map,
  Car,
  Zap,
  AlertTriangle,
  Building2,
  BarChart3,
  Users,
  Cpu,
  ScrollText,
  HeartPulse,
  UserCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { canAccess, isPlatformAdmin } from '../../utils/permissions';
import YatraLogo from '../common/YatraLogo';

interface NavSection {
  title: string;
  items: {
    to: string;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
  }[];
}

const navSections: NavSection[] = [
  {
    title: 'OPERATIONS',
    items: [
      { to: '/', icon: LayoutDashboard, label: 'Overview' },
      { to: '/live-fleet', icon: Map, label: 'Live Fleet' },
      { to: '/vehicles', icon: Car, label: 'Vehicles' },
      { to: '/charging', icon: Zap, label: 'Charging' },
      { to: '/alerts', icon: AlertTriangle, label: 'Alerts' },
      { to: '/departments', icon: Building2, label: 'Departments' },
      { to: '/analytics', icon: BarChart3, label: 'Analytics' },
    ],
  },
  {
    title: 'ADMINISTRATION',
    items: [
      { to: '/users', icon: Users, label: 'Users & Roles' },
      { to: '/devices', icon: Cpu, label: 'Devices' },
      { to: '/audit-logs', icon: ScrollText, label: 'Audit Logs' },
      { to: '/system-health', icon: HeartPulse, label: 'System Health' },
    ],
  },
  {
    title: 'ACCOUNT',
    items: [
      { to: '/profile', icon: UserCircle, label: 'Profile' },
    ],
  },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  const userRole = user?.role || '';
  const isAdmin = isPlatformAdmin(userRole);

  return (
    <aside
      className={`flex flex-col bg-slate-900 text-slate-300 border-r border-slate-800 select-none transition-all duration-300 z-30 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center h-16 px-4 border-b border-slate-800/80 bg-slate-950/60">
        {collapsed ? (
          <div className="w-full flex justify-center">
            <YatraLogo variant="icon" height={32} />
          </div>
        ) : (
          <div className="flex items-center justify-between w-full overflow-hidden">
            <div className="flex items-center gap-3">
              <YatraLogo variant="full" height={32} />
            </div>
            <span className="text-[10px] font-bold tracking-widest px-2 py-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20 uppercase shrink-0">
              {isAdmin ? 'ADMIN' : user?.department_name || 'DEPT'}
            </span>
          </div>
        )}
      </div>

      {/* Sub-header tag line when expanded */}
      {!collapsed && (
        <div className="px-4 py-2 bg-slate-950/30 border-b border-slate-800/40 text-[10px] font-bold text-slate-400 tracking-wider uppercase">
          Rajasthan EV Command Center
        </div>
      )}

      {/* Nav Menu */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-5">
        {navSections.map((section) => {
          const visibleItems = section.items.filter((item) => canAccess(userRole, item.to));
          if (visibleItems.length === 0) return null;

          return (
            <div key={section.title} className="space-y-1">
              {!collapsed && (
                <h4 className="px-3 text-[10px] font-extrabold tracking-widest text-slate-400 uppercase">
                  {section.title}
                </h4>
              )}
              <div className="space-y-0.5">
                {visibleItems.map((item) => {
                  const isActive =
                    item.to === '/'
                      ? location.pathname === '/'
                      : location.pathname.startsWith(item.to);

                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      title={collapsed ? item.label : undefined}
                      className={`group flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-teal-600/20 text-teal-300 border-l-4 border-teal-500 font-bold shadow-sm'
                          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                      }`}
                    >
                      <item.icon
                        className={`h-4 w-4 shrink-0 transition-colors ${
                          isActive ? 'text-teal-400' : 'text-slate-400 group-hover:text-slate-200'
                        }`}
                      />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Footer / Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-between px-4 h-11 border-t border-slate-800/80 bg-slate-950/40 text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors text-xs font-semibold"
      >
        {!collapsed && <span>Collapse Sidebar</span>}
        {collapsed ? <ChevronRight className="h-4 w-4 mx-auto" /> : <ChevronLeft className="h-4 w-4" />}
      </button>
    </aside>
  );
}
