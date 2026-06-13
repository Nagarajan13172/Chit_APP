import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as paymentsApi from "@/api/payments.api";
import { getApiErrorMessage } from "@/api/client";
import { collectionKeys } from "@/features/collections/queries";
import { planKeys } from "@/features/plans/queries";
import type { CreatePaymentPayload, PaymentListParams } from "@/types/payment";

export const paymentKeys = {
  all: ["payments"] as const,
  lists: () => [...paymentKeys.all, "list"] as const,
  list: (params: PaymentListParams) => [...paymentKeys.lists(), params] as const,
  receipt: (id: number) => [...paymentKeys.all, "receipt", id] as const,
};

export function usePayments(params: PaymentListParams) {
  return useQuery({
    queryKey: paymentKeys.list(params),
    queryFn: () => paymentsApi.listPayments(params),
    placeholderData: keepPreviousData,
  });
}

export function useReceipt(paymentId: number, enabled = true) {
  return useQuery({
    queryKey: paymentKeys.receipt(paymentId),
    queryFn: () => paymentsApi.getReceipt(paymentId),
    enabled: enabled && Number.isInteger(paymentId) && paymentId > 0,
  });
}

export function useRecordPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePaymentPayload) => paymentsApi.recordPayment(payload),
    onSuccess: (receipt) => {
      // A payment touches the schedule, customer history/pending, payment lists,
      // and possibly the membership status (→ COMPLETED) shown on plan pages.
      queryClient.invalidateQueries({ queryKey: collectionKeys.all });
      queryClient.invalidateQueries({ queryKey: paymentKeys.all });
      queryClient.invalidateQueries({ queryKey: planKeys.all });
      toast.success(`Payment recorded · ${receipt.receiptNumber}`);
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Failed to record payment")),
  });
}
