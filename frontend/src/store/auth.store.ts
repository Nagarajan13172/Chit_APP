import { create } from "zustand";
import type { User } from "@/types/auth";
import {
  clearSession,
  getStoredUser,
  getToken,
  setStoredUser,
  setToken,
} from "@/lib/auth-storage";

interface AuthState {
  user: User | null;
  token: string | null;
  /** Persist a fresh login (token + user) to storage and memory. */
  setSession: (token: string, user: User) => void;
  /** Update just the user (e.g. after a profile refresh). */
  updateUser: (user: User) => void;
  /** Clear the session everywhere. */
  logout: () => void;
}

/**
 * Auth store, hydrated synchronously from localStorage so a page refresh keeps
 * the user signed in without a flash of the login screen.
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: getStoredUser(),
  token: getToken(),

  setSession: (token, user) => {
    setToken(token);
    setStoredUser(user);
    set({ token, user });
  },

  updateUser: (user) => {
    setStoredUser(user);
    set({ user });
  },

  logout: () => {
    clearSession();
    set({ token: null, user: null });
  },
}));
