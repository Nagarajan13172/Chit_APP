import type { User } from "@/types/auth";

/**
 * Single source of truth for the persisted session (JWT + user).
 *
 * The Axios interceptor reads the token here, and the auth store (Zustand)
 * writes through these helpers — so the API layer and the store stay in sync
 * without a circular dependency.
 */
const TOKEN_KEY = "chit.token";
const USER_KEY = "chit.user";

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* storage unavailable (private mode) — ignore */
  }
}

export function clearToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

export function getStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user: User): void {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    /* ignore */
  }
}

/** Clear both token and user — used on logout and on a 401 auto-logout. */
export function clearSession(): void {
  clearToken();
  try {
    localStorage.removeItem(USER_KEY);
  } catch {
    /* ignore */
  }
}
