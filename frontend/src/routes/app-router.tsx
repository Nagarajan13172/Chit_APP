import { lazy } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { AppLayout } from "@/components/layout/app-layout";
import { PortalLayout } from "@/components/portal/portal-layout";
import { PortalProtectedRoute } from "@/components/portal/portal-protected-route";
import { LoginPage } from "@/pages/login-page";
import { NotFoundPage } from "@/pages/not-found-page";
import { PortalLoginPage } from "@/pages/portal/portal-login-page";
import { RouteErrorPage } from "@/pages/route-error-page";

// In-shell pages are code-split so heavy deps (charts, calendar) load on demand.
const DashboardPage = lazy(() =>
  import("@/pages/dashboard-page").then((m) => ({ default: m.DashboardPage })),
);
const CustomersPage = lazy(() =>
  import("@/pages/customers-page").then((m) => ({ default: m.CustomersPage })),
);
const CustomerDetailSheet = lazy(() =>
  import("@/features/customers/customer-detail-sheet").then((m) => ({
    default: m.CustomerDetailSheet,
  })),
);
const PlansPage = lazy(() => import("@/pages/plans-page").then((m) => ({ default: m.PlansPage })));
const PlanDetailSheet = lazy(() =>
  import("@/features/plans/plan-detail-sheet").then((m) => ({ default: m.PlanDetailSheet })),
);
const CollectionsPage = lazy(() =>
  import("@/pages/collections-page").then((m) => ({ default: m.CollectionsPage })),
);
const CustomerCollectionsPage = lazy(() =>
  import("@/pages/customer-collections-page").then((m) => ({ default: m.CustomerCollectionsPage })),
);
const MembershipSchedulePage = lazy(() =>
  import("@/pages/membership-schedule-page").then((m) => ({ default: m.MembershipSchedulePage })),
);
const ReportsPage = lazy(() =>
  import("@/pages/reports-page").then((m) => ({ default: m.ReportsPage })),
);
const RemindersPage = lazy(() =>
  import("@/pages/reminders-page").then((m) => ({ default: m.RemindersPage })),
);

// Member portal pages (customer-facing).
const PortalDashboardPage = lazy(() =>
  import("@/pages/portal/portal-dashboard-page").then((m) => ({ default: m.PortalDashboardPage })),
);
const PortalChitsPage = lazy(() =>
  import("@/pages/portal/portal-chits-page").then((m) => ({ default: m.PortalChitsPage })),
);
const PortalPaymentsPage = lazy(() =>
  import("@/pages/portal/portal-payments-page").then((m) => ({ default: m.PortalPaymentsPage })),
);
const PortalProfilePage = lazy(() =>
  import("@/pages/portal/portal-profile-page").then((m) => ({ default: m.PortalProfilePage })),
);

const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    element: <ProtectedRoute />,
    errorElement: <RouteErrorPage />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          {
            path: "customers",
            element: <CustomersPage />,
            children: [{ path: ":id", element: <CustomerDetailSheet /> }],
          },
          {
            path: "plans",
            element: <PlansPage />,
            children: [{ path: ":id", element: <PlanDetailSheet /> }],
          },
          { path: "collections", element: <CollectionsPage /> },
          { path: "collections/customers/:id", element: <CustomerCollectionsPage /> },
          { path: "collections/memberships/:id", element: <MembershipSchedulePage /> },
          { path: "reminders", element: <RemindersPage /> },
          { path: "reports", element: <ReportsPage /> },
        ],
      },
    ],
  },
  // ── Member portal (customer-facing, separate auth) ──
  { path: "/portal/login", element: <PortalLoginPage /> },
  {
    path: "/portal",
    element: <PortalProtectedRoute />,
    errorElement: <RouteErrorPage />,
    children: [
      {
        element: <PortalLayout />,
        children: [
          { index: true, element: <PortalDashboardPage /> },
          { path: "chits", element: <PortalChitsPage /> },
          { path: "payments", element: <PortalPaymentsPage /> },
          { path: "profile", element: <PortalProfilePage /> },
        ],
      },
    ],
  },
  { path: "*", element: <NotFoundPage /> },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
