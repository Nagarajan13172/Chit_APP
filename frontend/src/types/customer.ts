/** Customer domain types, mirroring the backend Customer model + list contract. */
import type { ListResponse, PaginationMeta, SortOrder } from "./common";

export type { PaginationMeta, SortOrder };

/** Per-customer financial rollup (only present when the list is fetched withSummary). */
export interface CustomerSummary {
  groupName: string | null;
  groupCount: number;
  totalValue: number;
  amountPaid: number;
  totalDue: number;
  progress: number;
  overdueCount: number;
}

export interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
  area: string | null;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  /** Present on list + detail responses (Prisma `_count`). */
  _count?: { memberships: number };
  /** Present only on the enriched list (withSummary=true). */
  summary?: CustomerSummary;
}

export type CustomerStatusFilter = "UP_TO_DATE" | "OVERDUE";

/** GET /customers returns `data` + a sibling `pagination` (not nested). */
export type CustomerListResponse = ListResponse<Customer>;

export type CustomerSortBy = "name" | "phone" | "createdAt";

export interface CustomerListParams {
  page?: number;
  limit?: number;
  search?: string;
  area?: string;
  /** Filter by chit plan ("group") membership. */
  planId?: number;
  /** Filter by collection status. */
  status?: CustomerStatusFilter;
  /** Request the per-row financial summary. */
  withSummary?: boolean;
  sortBy?: CustomerSortBy;
  sortOrder?: SortOrder;
}

/** Payload for create/update. Optional fields are nullable so they can be cleared. */
export interface CustomerPayload {
  name: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  area?: string | null;
}
