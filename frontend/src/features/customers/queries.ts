import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import * as customersApi from "@/api/customers.api";
import { getApiErrorMessage } from "@/api/client";
import type { CustomerListParams, CustomerPayload } from "@/types/customer";

export const customerKeys = {
  all: ["customers"] as const,
  lists: () => [...customerKeys.all, "list"] as const,
  list: (params: CustomerListParams) => [...customerKeys.lists(), params] as const,
  detail: (id: number) => [...customerKeys.all, "detail", id] as const,
  areas: () => [...customerKeys.all, "areas"] as const,
};

/** Paginated customer list. Keeps previous page visible while the next loads. */
export function useCustomers(params: CustomerListParams) {
  return useQuery({
    queryKey: customerKeys.list(params),
    queryFn: () => customersApi.listCustomers(params),
    placeholderData: keepPreviousData,
  });
}

/** Single customer by id. */
export function useCustomer(id: number) {
  return useQuery({
    queryKey: customerKeys.detail(id),
    queryFn: () => customersApi.getCustomer(id),
    enabled: Number.isInteger(id) && id > 0,
  });
}

/**
 * Distinct areas for the filter dropdown. No dedicated backend endpoint exists,
 * so we derive them from a single larger fetch (fine for this dataset size).
 */
export function useCustomerAreas() {
  return useQuery({
    queryKey: customerKeys.areas(),
    queryFn: async () => {
      const res = await customersApi.listCustomers({ limit: 100, sortBy: "name", sortOrder: "asc" });
      const areas = new Set<string>();
      for (const c of res.data) {
        if (c.area) areas.add(c.area);
      }
      return Array.from(areas).sort((a, b) => a.localeCompare(b));
    },
    staleTime: 60_000,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CustomerPayload) => customersApi.createCustomer(payload),
    onSuccess: (customer) => {
      queryClient.invalidateQueries({ queryKey: customerKeys.all });
      toast.success(`Customer "${customer.name}" created`);
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Failed to create customer")),
  });
}

export function useUpdateCustomer(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<CustomerPayload>) => customersApi.updateCustomer(id, payload),
    onSuccess: (customer) => {
      queryClient.invalidateQueries({ queryKey: customerKeys.all });
      queryClient.setQueryData(customerKeys.detail(id), customer);
      toast.success(`Customer "${customer.name}" updated`);
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Failed to update customer")),
  });
}
