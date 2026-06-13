import axios, { AxiosHeaders, type AxiosError } from "axios";
import { env } from "@/config/env";
import { clearPortalSession, getPortalToken } from "@/lib/portal-storage";
import type { ApiError } from "@/api/types";

/**
 * Axios instance for the member portal. Attaches the customer JWT and, on 401,
 * clears the portal session and redirects to /portal/login (never the staff login).
 */
export const portalApi = axios.create({
  baseURL: env.apiUrl,
  headers: { "Content-Type": "application/json" },
});

portalApi.interceptors.request.use((config) => {
  const token = getPortalToken();
  if (token) {
    const headers = AxiosHeaders.from(config.headers);
    headers.set("Authorization", `Bearer ${token}`);
    config.headers = headers;
  }
  return config;
});

portalApi.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    const status = error.response?.status;
    const isLogin = Boolean(error.config?.url?.includes("/portal/login"));
    if (status === 401 && !isLogin) {
      clearPortalSession();
      if (window.location.pathname !== "/portal/login") {
        window.location.assign("/portal/login");
      }
    }
    return Promise.reject(error);
  },
);
