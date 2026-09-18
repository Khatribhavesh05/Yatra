export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { dateStyle: 'medium' });
}

export function formatRelativeTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diff = now - then;
  
  if (diff < 60_000) return 'Just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

export function formatBattery(soc: number | null | undefined): string {
  if (soc == null) return '—';
  return `${Math.round(soc)}%`;
}

export function formatSpeed(kph: number | null | undefined): string {
  if (kph == null) return '—';
  return `${Math.round(kph)} km/h`;
}

export function formatRange(km: number | null | undefined): string {
  if (km == null) return '—';
  return `${Math.round(km)} km`;
}

export function formatCoordinate(val: number | null | undefined): string {
  if (val == null) return '—';
  return val.toFixed(5);
}

export function getVehicleStatus(vehicle: {
  charging: boolean | null;
  speed_kph: number | null;
  connectivity_status: string | null;
  soc_pct: number | null;
}): 'active' | 'charging' | 'idle' | 'offline' | 'critical' {
  if (vehicle.connectivity_status === 'offline' || !vehicle.connectivity_status) return 'offline';
  if (vehicle.soc_pct != null && vehicle.soc_pct < 10) return 'critical';
  if (vehicle.charging) return 'charging';
  if (vehicle.speed_kph != null && vehicle.speed_kph > 2) return 'active';
  return 'idle';
}

export const statusColors: Record<string, string> = {
  active: 'bg-emerald-500',
  charging: 'bg-blue-500',
  idle: 'bg-amber-500',
  offline: 'bg-gray-400',
  critical: 'bg-red-500',
};

export const statusLabels: Record<string, string> = {
  active: 'Active',
  charging: 'Charging',
  idle: 'Idle',
  offline: 'Offline',
  critical: 'Critical',
};

export const severityColors: Record<string, string> = {
  critical: 'bg-red-600 text-white',
  high: 'bg-orange-500 text-white',
  medium: 'bg-yellow-500 text-black',
  low: 'bg-blue-500 text-white',
  info: 'bg-gray-400 text-white',
};
