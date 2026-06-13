import { api } from "@/api/client";
import type { ApiSuccess } from "@/api/types";
import type {
  CreatePaymentPayload,
  PaymentListParams,
  PaymentListResponse,
  Receipt,
} from "@/types/payment";

/** POST /payments — record a collection; returns the receipt. */
export async function recordPayment(payload: CreatePaymentPayload): Promise<Receipt> {
  const { data } = await api.post<ApiSuccess<Receipt>>("/payments", payload);
  return data.data;
}

/** GET /payments — paginated, filterable payment list. */
export async function listPayments(params: PaymentListParams): Promise<PaymentListResponse> {
  const { data } = await api.get<PaymentListResponse>("/payments", { params });
  return data;
}

/** GET /payments/:id/receipt — rebuild a stored receipt. */
export async function getReceipt(paymentId: number): Promise<Receipt> {
  const { data } = await api.get<ApiSuccess<Receipt>>(`/payments/${paymentId}/receipt`);
  return data.data;
}
