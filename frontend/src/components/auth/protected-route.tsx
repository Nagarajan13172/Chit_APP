import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useIsAuthenticated } from "@/hooks/use-auth";

/**
 * Gate for authenticated routes. Redirects to /login when no session exists,
 * remembering the attempted path so the user lands back there after signing in.
 */
export function ProtectedRoute() {
  const isAuthenticated = useIsAuthenticated();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <Outlet />;
}
