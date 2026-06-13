import { QueryClient } from "@tanstack/react-query";

/** App-wide React Query client with sensible defaults for a CRUD admin UI. */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});
