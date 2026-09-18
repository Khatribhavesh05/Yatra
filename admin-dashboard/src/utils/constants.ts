export const ROUTES = {
  LOGIN: '/login',
  OVERVIEW: '/',
  LIVE_FLEET: '/live-fleet',
  DEPARTMENTS: '/departments',
  DEPARTMENT_DETAIL: '/departments/:id',
  VEHICLES: '/vehicles',
  VEHICLE_DETAIL: '/vehicles/:id',
  ALERTS: '/alerts',
  CHARGING: '/charging',
  USERS: '/users',
  DEVICES: '/devices',
  ANALYTICS: '/analytics',
  AUDIT_LOGS: '/audit-logs',
  SYSTEM_HEALTH: '/system-health',
  PROFILE: '/profile',
  SETTINGS: '/settings',
} as const;

export const QUERY_KEYS = {
  ME: ['auth', 'me'],
  DEPARTMENTS: ['departments'],
  USERS: ['users'],
  VEHICLES: ['vehicles'],
  VEHICLE_DETAIL: (id: string) => ['vehicles', id],
  VEHICLE_TRACK: (id: string) => ['vehicles', id, 'track'],
  ALERTS: ['alerts'],
  DEVICES: ['devices'],
  CHARGING_CENTERS: ['charging-centers'],
  AUDIT_LOGS: ['audit-logs'],
  HEALTH: ['health'],
} as const;

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'ce_access_token',
  REFRESH_TOKEN: 'ce_refresh_token',
} as const;

export const DEFAULT_PAGE_SIZE = 50;
export const MAX_PAGE_SIZE = 200;
