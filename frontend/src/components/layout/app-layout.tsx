import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { titleForPath } from "@/config/nav";
import { AppSidebar } from "./app-sidebar";
import { AppTopbar } from "./app-topbar";

/** Authenticated app shell: sidebar + topbar wrapping the routed page. */
export function AppLayout() {
  const { pathname } = useLocation();

  useEffect(() => {
    const title = titleForPath(pathname);
    document.title = title ? `${title} · Chit Manager` : "Chit Manager";
  }, [pathname]);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppTopbar />
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
