/**
 * Format relative time (e.g., "Just now", "2 min ago", "1 hr ago")
 */
export function formatRelativeTime(dateString?: string | null): string {
  if (!dateString) return 'Unknown';
  const date = new Date(dateString);
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSec < 20) return 'Just now (LIVE)';
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

/**
 * Format vehicle type nicely for citizens
 */
export function formatVehicleType(type: string): string {
  switch (type) {
    case 'electric_bus':
      return 'City Electric Bus';
    case 'ambulance_ev':
      return 'Emergency EV Ambulance';
    case 'fire_ev':
      return 'Civil Defense Fire EV';
    case 'utility_ev':
      return 'Municipal Utility EV';
    default:
      return 'Public Clean Vehicle';
  }
}

/**
 * Format charging station status badge styling & label
 */
export function formatStationStatus(status: string): { label: string; bg: string; text: string; dot: string } {
  switch (status?.toLowerCase()) {
    case 'operational':
      return { label: 'Operational (Open)', bg: 'bg-primary-container/10', text: 'text-primary', dot: 'bg-primary' };
    case 'limited':
      return { label: 'Limited Availability', bg: 'bg-amber-100', text: 'text-amber-800', dot: 'bg-amber-500' };
    case 'offline':
      return { label: 'Temporarily Offline', bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500' };
    case 'under_maintenance':
      return { label: 'Under Maintenance', bg: 'bg-gray-200', text: 'text-gray-700', dot: 'bg-gray-500' };
    default:
      return { label: 'Active Station', bg: 'bg-primary-container/10', text: 'text-primary', dot: 'bg-primary' };
  }
}
