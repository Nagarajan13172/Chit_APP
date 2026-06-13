import { lazy } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { AppLayout } from "@/components/layout/app-layout";
import { LoginPage } from "@/pages/login-page";
import { NotFoundPage } from "@/pages/not-found-page";
import { RouteErrorPage } from "@/pages/route-error-page";

// In-shell pages are code-split so heavy deps (charts, calendar) load on demand.
const DashboardPage = lazy(() =>
  import("@/pages/dashboard-page").then((m) => ({ default: m.DashboardPage })),
);
const CustomersPage = lazy(() =>
  import("@/pages/customers-page").then((m) => ({ default: m.CustomersPage })),
);
const CustomerDetailPage = lazy(() =>
  import("@/pages/customer-detail-page").then((m) => ({ default: m.CustomerDetailPage })),
);
const PlansPage = lazy(() => import("@/pages/plans-page").then((m) => ({ default: m.PlansPage })));
const PlanDetailPage = lazy(() =>
  import("@/pages/plan-detail-page").then((m) => ({ default: m.PlanDetailPage })),
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
          { path: "customers", element: <CustomersPage /> },
          { path: "customers/:id", element: <CustomerDetailPage /> },
          { path: "plans", element: <PlansPage /> },
          { path: "plans/:id", element: <PlanDetailPage /> },
          { path: "collections", element: <CollectionsPage /> },
          { path: "collections/customers/:id", element: <CustomerCollectionsPage /> },
          { path: "collections/memberships/:id", element: <MembershipSchedulePage /> },
          { path: "reports", element: <ReportsPage /> },
        ],
      },
    ],
  },
  { path: "*", element: <NotFoundPage /> },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
