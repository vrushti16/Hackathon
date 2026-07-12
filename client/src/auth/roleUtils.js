// src/auth/roleUtils.js
// Utility functions and constants for Role Based Access Control (RBAC)

export const ROLES = {
  ADMIN: 'Admin',

  DRIVER: 'Driver',
  SAFETY_OFFICER: 'Safety Officer',
  FINANCIAL_ANALYST: 'Financial Analyst'
};

// Map each role to an array of allowed route paths
export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    '/dashboard',
    '/vehicles',
    '/drivers',
    '/trips',
    '/fuel',
    '/maintenance',
    '/expenses',
    '/reports',
    '/settings',
    '/users'
  ],
  [ROLES.FLEET_MANAGER]: [
    '/dashboard',
    '/vehicles',
    '/trips',
    '/maintenance'
  ],
  [ROLES.DRIVER]: [
    '/dashboard',
    '/trips',
    '/fuel'
  ],
  [ROLES.SAFETY_OFFICER]: [
    '/dashboard',
    '/drivers'
  ],
  [ROLES.FINANCIAL_ANALYST]: [
    '/dashboard',
    '/expenses',
    '/reports'
  ]
};

/**
 * Checks if a user role has access to a specific path
 * @param {string} role - The user's role
 * @param {string} path - The path to check access for
 * @returns {boolean} True if the role has permission for the path
 */
export const hasAccessToRoute = (role, path) => {
  if (!role || !ROLE_PERMISSIONS[role]) return false;
  return ROLE_PERMISSIONS[role].includes(path);
};
