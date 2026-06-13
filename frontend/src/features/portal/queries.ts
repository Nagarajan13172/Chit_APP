import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as portalApi from "@/api/portal.api";
import { getApiErrorMessage } from "@/api/client";
import { usePortalAuthStore } from "@/store/portal-auth.store";
import type { PortalProfilePayload } from "@/types/portal";

export const portalKeys = {
  all: ["portal"] as const,
  dashboard: () => [...portalKeys.all, "dashboard"] as const,
  chits: () => [...portalKeys.all, "chits"] as const,
  payments: () => [...portalKeys.all, "payments"] as const,
};

export function usePortalDashboard() {
  return useQuery({ queryKey: portalKeys.dashboard(), queryFn: portalApi.getDashboard });
}

export function usePortalChits() {
  return useQuery({ queryKey: portalKeys.chits(), queryFn: portalApi.getChits });
}

export function usePortalPayments() {
  return useQuery({ queryKey: portalKeys.payments(), queryFn: portalApi.getPayments });
}

export function usePortalUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PortalProfilePayload) => portalApi.updateProfile(payload),
    onSuccess: (customer) => {
      usePortalAuthStore.getState().updateCustomer(customer);
      queryClient.invalidateQueries({ queryKey: portalKeys.all });
      toast.success("Profile updated");
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Failed to update profile")),
  });
}

export function usePortalPay() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (membershipId: number) => portalApi.pay(membershipId),
    onSuccess: (receipt) => {
      queryClient.invalidateQueries({ queryKey: portalKeys.all });
      toast.success(`Payment successful · ${receipt.receiptNumber}`);
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Payment failed")),
  });
}
