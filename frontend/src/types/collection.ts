/** Collection (installment schedule / history / pending) domain types. */
import type { PaymentMode } from "./payment";
import type { MembershipStatus } from "./plan";

export type InstallmentStatus = "PENDING" | "PARTIAL" | "PAID" | "OVERDUE";

export interface InstallmentPayment {
  id: number;
  amount: number;
  lateFee: number;
  mode: PaymentMode;
  receiptNumber: string;
  paidAt: string;
}

export interface InstallmentView {
  id: number;
  monthNumber: number;
  dueDate: string;
  dueAmount: number;
  paidAmount: number;
  lateFeePaid: number;
  pending: number;
  status: InstallmentStatus;
  isOverdue: boolean;
  /** Present on schedule + history (absent on the light pending path). */
  payments?: InstallmentPayment[];
}

export interface ScheduleSummary {
  installmentCount: number;
  totalDue: number;
  totalPaid: number;
  totalPending: number;
  overpaid: number;
  lateFeesPaid: number;
  paidCount: number;
  partialCount: number;
  pendingCount: number;
  overdueCount: number;
}

/** GET /memberships/:id/installments */
export interface MembershipSchedule {
  membership: {
    id: number;
    ticketNumber: number | null;
    status: MembershipStatus;
    plan: {
      id: number;
      name: string;
      installmentAmount: string;
      durationMonths: number;
      chitValue: string;
    };
    customer: { id: number; name: string; phone: string };
  };
  summary: ScheduleSummary;
  installments: InstallmentView[];
}

export interface CustomerHistoryMembership {
  membershipId: number;
  ticketNumber: number | null;
  status: MembershipStatus;
  plan: { id: number; name: string; installmentAmount: string; durationMonths: number };
  summary: ScheduleSummary;
  installments: InstallmentView[];
}

/** GET /customers/:id/history */
export interface CustomerHistory {
  customer: { id: number; name: string; phone: string; area: string | null };
  summary: ScheduleSummary;
  memberships: CustomerHistoryMembership[];
}

export interface CustomerPendingPlan {
  membershipId: number;
  planId: number;
  planName: string;
  totalDue: number;
  totalPaid: number;
  pending: number;
  overdueCount: number;
}

/** GET /customers/:id/pending */
export interface CustomerPending {
  customerId: number;
  customerName: string;
  totalDue: number;
  totalPaid: number;
  totalPending: number;
  overdueCount: number;
  byPlan: CustomerPendingPlan[];
}
