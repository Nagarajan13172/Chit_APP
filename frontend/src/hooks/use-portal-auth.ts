import { usePortalAuthStore } from "@/store/portal-auth.store";

export const usePortalCustomer = () => usePortalAuthStore((s) => s.customer);
export const useIsPortalAuthenticated = () => usePortalAuthStore((s) => Boolean(s.token));
export const usePortalSetSession = () => usePortalAuthStore((s) => s.setSession);
export const usePortalLogout = () => usePortalAuthStore((s) => s.logout);
