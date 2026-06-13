import { create } from "zustand";
import {
  clearPortalSession,
  getPortalToken,
  getStoredPortalCustomer,
  setPortalToken,
  setStoredPortalCustomer,
} from "@/lib/portal-storage";
import type { PortalCustomer } from "@/types/portal";

interface PortalAuthState {
  customer: PortalCustomer | null;
  token: string | null;
  setSession: (token: string, customer: PortalCustomer) => void;
  logout: () => void;
}

/** Member-portal auth store, hydrated from localStorage (separate from staff). */
export const usePortalAuthStore = create<PortalAuthState>((set) => ({
  customer: getStoredPortalCustomer(),
  token: getPortalToken(),
  setSession: (token, customer) => {
    setPortalToken(token);
    setStoredPortalCustomer(customer);
    set({ token, customer });
  },
  logout: () => {
    clearPortalSession();
    set({ token: null, customer: null });
  },
}));
