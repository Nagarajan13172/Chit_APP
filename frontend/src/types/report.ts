/** Reporting/dashboard domain types (all monetary fields are numbers). */
import type { ListResponse } from "./common";
import type { PaymentMode } from "./payment";

export interface ReportSummary {
  totalCustomers: number;
  activeCustomers: number;
  activeChitGroups: number;
  collectionsThisMonth: { amount: number; lateFees: number; count: number };
  totalCollected: number;
  pending: { totalPending: number; overdueInstallments: number; defaulters: number };
}

export interface CollectionsReportParams {
  /** yyyy-MM-dd */
  from?: string;
  to?: string;
  planId?: number;
  mode?: PaymentMode;
  collectedBy?: number;
}

export interface CollectionsByMode {
  mode: PaymentMode;
  amount: number;
  count: number;
}

export interface CollectionsByPlan {
  planId: number;
  planName: string;
  amount: number;
  count: number;
}

export interface CollectionsReport {
  filters: {
    from: string | null;
    to: string | null;
    planId: number | null;
    mode: PaymentMode | null;
    collectedBy: number | null;
  };
  totals: { amount: number; lateFees: number; totalCollected: number; count: number };
  byMode: CollectionsByMode[];
  byPlan: CollectionsByPlan[];
}

export interface PendingReportParams {
  page?: number;
  limit?: number;
  planId?: number;
}

export interface PendingReportItem {
  membershipId: number;
  customer: { id: number; name: string; phone: string; area: string | null };
  plan: { id: number; name: string };
  totalDue: number;
  totalPaid: number;
  pending: number;
  overdueCount: number;
  oldestOverdueDate: string | null;
}

export type PendingReportResponse = ListResponse<PendingReportItem>;
