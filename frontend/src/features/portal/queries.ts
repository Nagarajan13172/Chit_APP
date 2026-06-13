import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as portalApi from "@/api/portal.api";
import { getApiErrorMessage } from "@/api/client";

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
