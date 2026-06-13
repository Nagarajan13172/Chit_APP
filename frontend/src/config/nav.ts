import {
  BarChart3,
  LayoutDashboard,
  Layers,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import type { Role } from "@/types/auth";

export interface NavItem {
  title: string;
  to: string;
  icon: LucideIcon;
  /** When set, only these roles see the item. Omit = everyone. */
  roles?: Role[];
  /** Match the path exactly for active state (used for the index route). */
  end?: boolean;
}

/**
 * Single source of truth for the sidebar menu. Routes, breadcrumbs and the
 * document title all derive from this list.
 */
export const NAV_ITEMS: NavItem[] = [
  { title: "Dashboard", to: "/", icon: LayoutDashboard, end: true },
  { title: "Customers", to: "/customers", icon: Users },
  { title: "Chit Plans", to: "/plans", icon: Layers },
  { title: "Collections", to: "/collections", icon: Wallet },
  { title: "Reports", to: "/reports", icon: BarChart3, roles: ["ADMIN"] },
];

/** Visible nav items for a given role (undefined role = signed out → none). */
export function navItemsForRole(role: Role | undefined): NavItem[] {
  return NAV_ITEMS.filter((item) => !item.roles || (role !== undefined && item.roles.includes(role)));
}

/** Human-readable title for a pathname (exact match, else longest prefix). */
export function titleForPath(pathname: string): string {
  const exact = NAV_ITEMS.find((item) => item.to === pathname);
  if (exact) return exact.title;

  const prefix = NAV_ITEMS.filter((item) => item.to !== "/" && pathname.startsWith(item.to)).sort(
    (a, b) => b.to.length - a.to.length,
  )[0];

  return prefix?.title ?? "";
}
