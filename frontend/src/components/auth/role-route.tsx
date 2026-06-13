import { Navigate, Outlet } from "react-router-dom";
import { useHasRole } from "@/hooks/use-auth";
import type { Role } from "@/types/auth";

interface RoleRouteProps {
  roles: Role[];
  /** Where to send users who lack the role (default: dashboard). */
  redirectTo?: string;
}

/**
 * Route-level role guard. Renders the nested routes only when the current user
 * has one of `roles`; otherwise redirects.
 */
export function RoleRoute({ roles, redirectTo = "/" }: RoleRouteProps) {
  const allowed = useHasRole(...roles);
  return allowed ? <Outlet /> : <Navigate to={redirectTo} replace />;
}
