/** Payment + receipt domain types, mirroring the backend payments module. */
import type { ListResponse, SortOrder } from "./common";
import type { InstallmentStatus } from "./collection";
import type { MembershipStatus } from "./plan";

export type PaymentMode = "CASH" | "UPI" | "CHEQUE";

/** A row from GET /payments. */
export interface PaymentListItem {
  id: number;
  receiptNumber: string;
  amount: number;
  lateFee: number;
  totalCollected: number;
  mode: PaymentMode;
  referenceNumber: string | null;
  paidAt: string;
  monthNumber: number;
  installmentId: number;
  membershipId: number;
  customer: { id: number; name: string; phone: string };
  plan: { id: number; name: string };
  collectedBy: { id: number; name: string } | null;
}

export interface PaymentListParams {
  page?: number;
  limit?: number;
  mode?: PaymentMode;
  customerId?: number;
  membershipId?: number;
  /** ISO date (yyyy-MM-dd). */
  from?: string;
  to?: string;
  sortOrder?: SortOrder;
}

export type PaymentListResponse = ListResponse<PaymentListItem>;

export interface CreatePaymentPayload {
  installmentId: number;
  amount: number;
  lateFee?: number;
  mode: PaymentMode;
  referenceNumber?: string;
  notes?: string;
}

/** Receipt returned by POST /payments and GET /payments/:id/receipt. */
export interface Receipt {
  receiptNumber: string;
  paymentId: number;
  paidAt: string;
  customer: { id: number; name: string; phone: string };
  plan: { id: number; name: string };
  membership: { id: number; ticketNumber: number | null; status: MembershipStatus };
  installment: {
    id: number;
    monthNumber: number;
    dueDate: string;
    dueAmount: number;
    status: InstallmentStatus;
    pendingAfter: number;
  };
  payment: {
    mode: PaymentMode;
    referenceNumber: string | null;
    notes: string | null;
    amount: number;
    lateFee: number;
    totalCollected: number;
  };
  collectedBy: { id: number; name: string } | null;
}
