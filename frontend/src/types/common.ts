/** Shared API primitives used across feature modules. */

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export type SortOrder = "asc" | "desc";

/** List endpoints return `data` + a sibling `pagination` (not nested). */
export interface ListResponse<T> {
  success: true;
  data: T[];
  pagination: PaginationMeta;
}
