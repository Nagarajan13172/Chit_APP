import { useAuthStore } from "@/store/auth.store";
import type { Role } from "@/types/auth";

/** The current user, or null when signed out. */
export const useUser = () => useAuthStore((s) => s.user);

/** Whether a session token is present. */
export const useIsAuthenticated = () => useAuthStore((s) => Boolean(s.token));

/** True when the current user holds any of the given roles. */
export function useHasRole(...roles: Role[]): boolean {
  return useAuthStore((s) => (s.user ? roles.includes(s.user.role) : false));
}

/** Action: establish a session after login. */
export const useSetSession = () => useAuthStore((s) => s.setSession);

/** Action: clear the session (logout). */
export const useLogout = () => useAuthStore((s) => s.logout);
