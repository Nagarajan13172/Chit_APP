import axios, { AxiosError, AxiosHeaders } from "axios";
import { env } from "@/config/env";
import { getToken, clearSession } from "@/lib/auth-storage";
import type { ApiError } from "@/api/types";

/**
 * Shared Axios instance for the Chit API.
 *
 * - Request:  attaches `Authorization: Bearer <token>` when a JWT is stored.
 * - Response: on 401, clears the token and redirects to /login (auto-logout),
 *             unless the failing request was the login call itself.
 */
export const api = axios.create({
  baseURL: env.apiUrl,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    const headers = AxiosHeaders.from(config.headers);
    headers.set("Authorization", `Bearer ${token}`);
    config.headers = headers;
  }
  return config;
});

function isLoginRequest(url?: string): boolean {
  return Boolean(url && url.includes("/auth/login"));
}

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    const status = error.response?.status;

    if (status === 401 && !isLoginRequest(error.config?.url)) {
      clearSession();
      // Hard redirect avoids needing router context inside the API layer.
      if (window.location.pathname !== "/login") {
        window.location.assign("/login");
      }
    }

    return Promise.reject(error);
  }
);

/** Extract a human-readable message from an Axios error (falls back gracefully). */
export function getApiErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message ?? error.message ?? fallback;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}
