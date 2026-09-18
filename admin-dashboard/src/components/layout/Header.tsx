import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useWebSocket } from '../../hooks/useWebSocket';
import { LogOut, Wifi, WifiOff, Loader, Shield } from 'lucide-react';
import { UserRoleLabels } from '../../types/enums';
import { isPlatformAdmin } from '../../utils/permissions';

export default function Header() {
  const { user, logout } = useAuth();
  const { connectionState } = useWebSocket();

  const isAdmin = user ? isPlatformAdmin(user.role) : false;

  const isConnected = connectionState === 'connected';

  return (
    <header className="flex items-center justify-between h-16 px-6 bg-white border-b border-slate-200/90 shadow-xs z-20">
      {/* Page / Context Identity */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-teal-700" />
          <div>
            <h1 className="text-sm font-bold text-slate-900 tracking-tight">
              {isAdmin
                ? 'Rajasthan Government EV Fleet Intelligence Platform'
                : `${user?.department_name || 'Department'} Operations Center`}
            </h1>
            <p className="text-[11px] font-medium text-slate-500">
              Department of Transport & Energy • State Control Room
            </p>
          </div>
        </div>
      </div>

      {/* Right Toolbar */}
      <div className="flex items-center gap-5">
        {/* Real-time Connection Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200">
          <span className="relative flex h-2.5 w-2.5">
            {isConnected ? (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-600"></span>
              </>
            ) : (
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            )}
          </span>
          <span className="text-xs font-bold text-slate-700 tracking-wider">
            {connectionState === 'connected'
              ? 'LIVE TELEMETRY'
              : connectionState.toUpperCase()}
          </span>
        </div>

        {/* User Identity Dossier */}
        {user && (
          <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
            <div className="text-right">
              <div className="text-xs font-bold text-slate-900 leading-snug">{user.full_name}</div>
              <div className="text-[11px] font-medium text-slate-500">
                {UserRoleLabels[user.role] || user.role}
                {user.department_name && ` • ${user.department_name}`}
              </div>
            </div>
            <div className="h-9 w-9 rounded-lg bg-teal-700 text-white font-bold text-xs flex items-center justify-center shadow-xs">
              {user.full_name.charAt(0).toUpperCase()}
            </div>
          </div>
        )}

        {/* Logout Action */}
        <button
          onClick={logout}
          className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
          title="Sign out of Yatra Operations"
        >
          <LogOut className="h-4.5 w-4.5" />
        </button>
      </div>
    </header>
  );
}
