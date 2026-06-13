/**
 * Centralized, typed access to Vite environment variables.
 * All client-exposed vars must be prefixed with `VITE_`.
 */
export const env = {
  /** Base URL of the Chit backend API, e.g. http://localhost:4000/api */
  apiUrl: import.meta.env.VITE_API_URL ?? "http://localhost:4000/api",
} as const;
