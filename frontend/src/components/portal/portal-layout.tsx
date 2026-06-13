import { LayoutDashboard, Layers, LogOut, PiggyBank, UserRound, Wallet } from "lucide-react";
import { Suspense, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { PageLoader } from "@/components/common/page-loader";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { usePortalCustomer, usePortalLogout } from "@/hooks/use-portal-auth";
import { avatarTint, initials } from "@/lib/avatar";
import { cn } from "@/lib/utils";

const NAV = [
  { title: "Dashboard", to: "/portal", icon: LayoutDashboard, end: true },
  { title: "My Chits", to: "/portal/chits", icon: Layers, end: false },
  { title: "Payments", to: "/portal/payments", icon: Wallet, end: false },
  { title: "Profile", to: "/portal/profile", icon: UserRound, end: false },
];

function isActive(pathname: string, to: string, end: boolean) {
  return end ? pathname === to : pathname === to || pathname.startsWith(`${to}/`);
}

export function PortalLayout() {
  const { pathname } = useLocation();
  const customer = usePortalCustomer();
  const logout = usePortalLogout();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "ChitFund Pro";
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/portal/login", { replace: true });
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 px-1 py-1.5">
            <div className="flex aspect-square size-9 items-center justify-center rounded-lg bg-blue-600 text-white">
              <PiggyBank className="size-5" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">ChitFund Pro</span>
              <span className="truncate text-xs text-muted-foreground">Manage Investments</span>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {NAV.map((item) => (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton asChild isActive={isActive(pathname, item.to, item.end)}>
                      <Link to={item.to}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <div className="flex items-center gap-2 px-1 py-1">
            <Avatar className="size-9">
              <AvatarFallback className={cn("text-xs font-medium", avatarTint(customer?.name ?? "?"))}>
                {initials(customer?.name ?? "?")}
              </AvatarFallback>
            </Avatar>
            <div className="grid min-w-0 flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{customer?.name}</span>
              <span className="truncate text-xs text-muted-foreground">
                {customer?.email ?? customer?.phone}
              </span>
            </div>
            <Button variant="ghost" size="icon" className="size-8" onClick={handleLogout} aria-label="Log out">
              <LogOut className="size-4" />
            </Button>
          </div>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <span className="text-sm font-medium">Member Portal</span>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </header>
        <main className="flex-1 bg-muted/30 p-4 md:p-6">
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
