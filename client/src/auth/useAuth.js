// src/auth/useAuth.js
// Enhanced authentication hook that includes Role Based Access Control (RBAC) utilities
import { useAuth as useBaseAuth } from '../context/AuthContext';
import { hasAccessToRoute } from './roleUtils';

export const useAuth = () => {
  const auth = useBaseAuth();

  // Helper to check if the current user has access to a specific route path
  const canAccessRoute = (path) => {
    return hasAccessToRoute(auth.user?.role, path);
  };

  // Helper to check if the current user's role is in a list of allowed roles
  const hasRole = (allowedRoles) => {
    if (!auth.user || !auth.user.role) return false;
    if (!allowedRoles || allowedRoles.length === 0) return true;
    return allowedRoles.includes(auth.user.role);
  };

  return {
    ...auth,
    canAccessRoute,
    hasRole,
  };
};

export default useAuth;
