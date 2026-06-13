import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { RoleRoute } from "@/components/auth/role-route";
import { AppLayout } from "@/components/layout/app-layout";
import { CollectionsPage } from "@/pages/collections-page";
import { CustomerCollectionsPage } from "@/pages/customer-collections-page";
import { CustomerDetailPage } from "@/pages/customer-detail-page";
import { CustomersPage } from "@/pages/customers-page";
import { MembershipSchedulePage } from "@/pages/membership-schedule-page";
import { DashboardPage } from "@/pages/dashboard-page";
import { LoginPage } from "@/pages/login-page";
import { NotFoundPage } from "@/pages/not-found-page";
import { PlanDetailPage } from "@/pages/plan-detail-page";
import { PlansPage } from "@/pages/plans-page";
import { ReportsPage } from "@/pages/reports-page";

const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    element: <ProtectedRoute />,
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
          // Admin-only section.
          {
            element: <RoleRoute roles={["ADMIN"]} />,
            children: [{ path: "reports", element: <ReportsPage /> }],
          },
        ],
      },
    ],
  },
  { path: "*", element: <NotFoundPage /> },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
