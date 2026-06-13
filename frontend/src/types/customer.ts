/** Customer domain types, mirroring the backend Customer model + list contract. */

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
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** GET /customers returns `data` + a sibling `pagination` (not nested). */
export interface CustomerListResponse {
  success: true;
  data: Customer[];
  pagination: PaginationMeta;
}

export type CustomerSortBy = "name" | "phone" | "createdAt";
export type SortOrder = "asc" | "desc";

export interface CustomerListParams {
  page?: number;
  limit?: number;
  search?: string;
  area?: string;
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
