import type { ReactNode } from "react";
import { useHasRole } from "@/hooks/use-auth";
import type { Role } from "@/types/auth";

interface RoleGuardProps {
  roles: Role[];
  children: ReactNode;
  /** Rendered when the user lacks the role (default: nothing). */
  fallback?: ReactNode;
}

/**
 * Inline role guard for hiding admin-only actions (buttons, menu items, etc.).
 * Use this within a page; use {@link RoleRoute} to guard whole routes.
 */
export function RoleGuard({ roles, children, fallback = null }: RoleGuardProps) {
  const allowed = useHasRole(...roles);
  return <>{allowed ? children : fallback}</>;
}
