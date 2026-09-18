import { UserRoles, type UserRole } from '../types/enums';

/**
 * Defines which sidebar nav items each role can see.
 * platform_admin sees everything.
 * Department roles see only operator-level pages.
 */

export type NavPermission = {
  route: string;
  roles: readonly UserRole[];
};

const ALL_ROLES: readonly UserRole[] = [
  UserRoles.PLATFORM_ADMIN,
  UserRoles.DEPARTMENT_ADMIN,
  UserRoles.DISPATCHER,
  UserRoles.ANALYST,
  UserRoles.MAINTENANCE,
];

const ADMIN_ONLY: readonly UserRole[] = [UserRoles.PLATFORM_ADMIN];

const OPERATOR_ROLES: readonly UserRole[] = [
  UserRoles.PLATFORM_ADMIN,
  UserRoles.DEPARTMENT_ADMIN,
  UserRoles.DISPATCHER,
  UserRoles.ANALYST,
  UserRoles.MAINTENANCE,
];

const ACK_ROLES: readonly UserRole[] = [
  UserRoles.PLATFORM_ADMIN,
  UserRoles.DEPARTMENT_ADMIN,
  UserRoles.DISPATCHER,
];

/**
 * Route-level permissions.
 * If a route is not listed here, it's accessible to all authenticated users.
 */
export const ROUTE_PERMISSIONS: NavPermission[] = [
  // Super-admin-only pages
  { route: '/departments', roles: ADMIN_ONLY },
  { route: '/users', roles: ADMIN_ONLY },
  { route: '/devices', roles: ADMIN_ONLY },
  { route: '/audit-logs', roles: ADMIN_ONLY },
  { route: '/system-health', roles: ADMIN_ONLY },

  // Shared pages (all operator roles + admin)
  { route: '/', roles: ALL_ROLES },
  { route: '/live-fleet', roles: OPERATOR_ROLES },
  { route: '/vehicles', roles: OPERATOR_ROLES },
  { route: '/alerts', roles: OPERATOR_ROLES },
  { route: '/charging', roles: ALL_ROLES },
  { route: '/analytics', roles: [UserRoles.PLATFORM_ADMIN, UserRoles.DEPARTMENT_ADMIN, UserRoles.ANALYST] },
  { route: '/profile', roles: ALL_ROLES },
];

/**
 * Check if a user role is allowed to access a route.
 */
export function canAccess(role: string, route: string): boolean {
  const perm = ROUTE_PERMISSIONS.find((p) => {
    if (p.route === route) return true;
    // Match prefix for nested routes like /departments/:id
    if (route.startsWith(p.route + '/')) return true;
    return false;
  });

  // If no permission rule found, allow by default
  if (!perm) return true;

  return perm.roles.includes(role as UserRole);
}

/**
 * Check if the user is a platform admin (super admin).
 */
export function isPlatformAdmin(role: string): boolean {
  return role === UserRoles.PLATFORM_ADMIN;
}

/**
 * Check if the user is a department-level role.
 */
export function isDepartmentRole(role: string): boolean {
  return ([
    UserRoles.DEPARTMENT_ADMIN,
    UserRoles.DISPATCHER,
    UserRoles.ANALYST,
    UserRoles.MAINTENANCE,
  ] as string[]).includes(role);
}

/**
 * Check if the user can acknowledge alerts.
 */
export function canAckAlerts(role: string): boolean {
  return ACK_ROLES.includes(role as UserRole);
}
