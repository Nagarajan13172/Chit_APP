import { useQuery } from "@tanstack/react-query";
import * as collectionsApi from "@/api/collections.api";

export const collectionKeys = {
  all: ["collections"] as const,
  membership: (id: number) => [...collectionKeys.all, "membership", id] as const,
  customerHistory: (id: number) => [...collectionKeys.all, "customer", id, "history"] as const,
  customerPending: (id: number) => [...collectionKeys.all, "customer", id, "pending"] as const,
};

export function useMembershipSchedule(membershipId: number) {
  return useQuery({
    queryKey: collectionKeys.membership(membershipId),
    queryFn: () => collectionsApi.getMembershipSchedule(membershipId),
    enabled: Number.isInteger(membershipId) && membershipId > 0,
  });
}

export function useCustomerHistory(customerId: number) {
  return useQuery({
    queryKey: collectionKeys.customerHistory(customerId),
    queryFn: () => collectionsApi.getCustomerHistory(customerId),
    enabled: Number.isInteger(customerId) && customerId > 0,
  });
}

export function useCustomerPending(customerId: number) {
  return useQuery({
    queryKey: collectionKeys.customerPending(customerId),
    queryFn: () => collectionsApi.getCustomerPending(customerId),
    enabled: Number.isInteger(customerId) && customerId > 0,
  });
}
