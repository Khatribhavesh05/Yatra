import { useAuth } from '../../hooks/useAuth';
import { useWebSocket } from '../../hooks/useWebSocket';
import { LogOut, Wifi, WifiOff, Loader } from 'lucide-react';
import { UserRoleLabels } from '../../types/enums';
import { isPlatformAdmin } from '../../utils/permissions';

export default function Header() {
  const { user, logout } = useAuth();
  const { connectionState } = useWebSocket();

  const isAdmin = user ? isPlatformAdmin(user.role) : false;

  const connIcon = {
    connected: <Wifi className="h-3.5 w-3.5 text-urja-primary" />,
    connecting: <Loader className="h-3.5 w-3.5 text-urja-warning animate-spin" />,
    reconnecting: <Loader className="h-3.5 w-3.5 text-urja-warning animate-spin" />,
    disconnected: <WifiOff className="h-3.5 w-3.5 text-urja-danger" />,
  };

  const connLabel = {
    connected: 'LIVE',
    connecting: 'CONNECTING',
    reconnecting: 'RECONNECTING',
    disconnected: 'OFFLINE',
  };

  const connColor = {
    connected: 'text-urja-primary',
    connecting: 'text-urja-warning',
    reconnecting: 'text-urja-warning',
    disconnected: 'text-urja-danger',
  };

  return (
    <header className="flex items-center justify-between h-14 px-6 bg-urja-surface border-b border-urja-border">
      <div>
        {isAdmin ? (
          <h1 className="text-sm font-semibold text-urja-text">
            EV Fleet Intelligence Platform
          </h1>
        ) : (
          <div>
            <h1 className="text-sm font-semibold text-urja-text">
              {user?.department_name || 'Department'} — Fleet Operations
            </h1>
          </div>
        )}
      </div>

      <div className="flex items-center gap-5">
        {/* Connection status */}
        <div className={`flex items-center gap-1.5 text-xs font-medium ${connColor[connectionState]}`}>
          {connIcon[connectionState]}
          <span>{connLabel[connectionState]}</span>
        </div>

        {/* User info */}
        {user && (
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm text-urja-text font-medium">{user.full_name}</div>
              <div className="text-[11px] text-urja-text-muted">
                {UserRoleLabels[user.role] || user.role}
                {isAdmin && user.department_name && ` · ${user.department_name}`}
              </div>
            </div>
            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
              isAdmin ? 'bg-urja-success/10 border border-emerald-600/30' : 'bg-urja-info/10 border border-urja-info/20'
            }`}>
              <span className={`text-xs font-semibold ${isAdmin ? 'text-urja-primary' : 'text-urja-info'}`}>
                {user.full_name.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={logout}
          className="flex items-center gap-1.5 text-xs text-urja-text-muted hover:text-urja-danger transition-colors"
          title="Logout"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
