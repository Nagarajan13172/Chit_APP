/** Member-portal domain types (customer-facing). Reuses shared shapes where possible. */
import type { CustomerHistoryMembership, ScheduleSummary } from "./collection";
import type { PaymentListItem, PaymentMode, Receipt } from "./payment";
import type { MembershipStatus } from "./plan";

export interface PortalCustomer {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
  area: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PortalCredentials {
  phone: string;
  password: string;
}

export interface PortalLoginResponse {
  token: string;
  customer: PortalCustomer;
}

export interface PortalNextDue {
  installmentId: number;
  monthNumber: number;
  dueDate: string;
  amount: number;
  isOverdue: boolean;
}

export interface PortalChit {
  membershipId: number;
  planName: string;
  ticketNumber: number | null;
  status: MembershipStatus;
  totalMonths: number;
  paidMonths: number;
  progress: number;
  totalValue: number;
  paid: number;
  pending: number;
  overdueCount: number;
  nextDue: PortalNextDue | null;
}

export interface PortalRecentPayment {
  id: number;
  planName: string;
  monthNumber: number;
  amount: number;
  mode: PaymentMode;
  receiptNumber: string;
  paidAt: string;
}

export interface PortalDashboard {
  customer: { id: number; name: string; phone: string; area: string | null };
  summary: {
    totalInvested: number;
    totalValue: number;
    totalPending: number;
    overdueCount: number;
    activeChits: number;
  };
  nextDue: (PortalNextDue & { membershipId: number; planName: string }) | null;
  chits: PortalChit[];
  recentPayments: PortalRecentPayment[];
}

export interface PortalChits {
  customer: { id: number; name: string; phone: string; area: string | null };
  summary: ScheduleSummary;
  memberships: CustomerHistoryMembership[];
}

export type PortalPayment = PaymentListItem;
export type PortalReceipt = Receipt;
