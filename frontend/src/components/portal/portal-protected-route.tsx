import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useIsPortalAuthenticated } from "@/hooks/use-portal-auth";

/** Gate for member-portal routes — redirects to /portal/login when signed out. */
export function PortalProtectedRoute() {
  const isAuthenticated = useIsPortalAuthenticated();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/portal/login" state={{ from: location.pathname }} replace />;
  }
  return <Outlet />;
}
