export const UserRoles = {
  PLATFORM_ADMIN: 'platform_admin',
  DEPARTMENT_ADMIN: 'department_admin',
  DISPATCHER: 'dispatcher',
  ANALYST: 'analyst',
  MAINTENANCE: 'maintenance',
} as const;

export type UserRole = typeof UserRoles[keyof typeof UserRoles];

export const UserRoleLabels: Record<string, string> = {
  platform_admin: 'Platform Admin',
  department_admin: 'Dept Admin',
  dispatcher: 'Dispatcher',
  analyst: 'Analyst',
  maintenance: 'Maintenance',
};

export const VehicleTypes = {
  ELECTRIC_BUS: 'electric_bus',
  FIRE_EV: 'fire_ev',
  UTILITY_EV: 'utility_ev',
  AMBULANCE_EV: 'ambulance_ev',
  OTHER: 'other',
} as const;

export const VehicleTypeLabels: Record<string, string> = {
  electric_bus: 'Electric Bus',
  fire_ev: 'Fire EV',
  utility_ev: 'Utility EV',
  ambulance_ev: 'Ambulance EV',
  other: 'Other',
};

export const AlertTypes = {
  LOW_SOC: 'LOW_SOC',
  LOW_RANGE: 'LOW_RANGE',
  VEHICLE_OFFLINE: 'VEHICLE_OFFLINE',
  GEOFENCE_BREACH: 'GEOFENCE_BREACH',
  OVERSPEED: 'OVERSPEED',
  HIGH_BATTERY_TEMP: 'HIGH_BATTERY_TEMP',
  DIAGNOSTIC_FAULT: 'DIAGNOSTIC_FAULT',
  CHARGING_INTERRUPTED: 'CHARGING_INTERRUPTED',
} as const;

export const AlertTypeLabels: Record<string, string> = {
  LOW_SOC: 'Low Battery',
  LOW_RANGE: 'Low Range',
  VEHICLE_OFFLINE: 'Vehicle Offline',
  GEOFENCE_BREACH: 'Geofence Breach',
  OVERSPEED: 'Overspeed',
  HIGH_BATTERY_TEMP: 'High Battery Temp',
  DIAGNOSTIC_FAULT: 'Diagnostic Fault',
  CHARGING_INTERRUPTED: 'Charging Interrupted',
};

export const AlertSeverities = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
  INFO: 'info',
} as const;

export const AlertSeverityLabels: Record<string, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
  info: 'Info',
};

export const AlertStatuses = {
  ACTIVE: 'active',
  ACKNOWLEDGED: 'acknowledged',
  RESOLVED: 'resolved',
  EXPIRED: 'expired',
} as const;

export const DeviceStatuses = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  MAINTENANCE: 'maintenance',
} as const;
