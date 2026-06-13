import type { PortalCustomer } from "@/types/portal";

/**
 * Persisted member-portal session — kept under different keys from the staff
 * session so the two apps never share auth state.
 */
const TOKEN_KEY = "chit.portal.token";
const CUSTOMER_KEY = "chit.portal.customer";

export function getPortalToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setPortalToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* ignore */
  }
}

export function getStoredPortalCustomer(): PortalCustomer | null {
  try {
    const raw = localStorage.getItem(CUSTOMER_KEY);
    return raw ? (JSON.parse(raw) as PortalCustomer) : null;
  } catch {
    return null;
  }
}

export function setStoredPortalCustomer(customer: PortalCustomer): void {
  try {
    localStorage.setItem(CUSTOMER_KEY, JSON.stringify(customer));
  } catch {
    /* ignore */
  }
}

export function clearPortalSession(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(CUSTOMER_KEY);
  } catch {
    /* ignore */
  }
}
