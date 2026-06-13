/**
 * Response envelopes returned by the Chit backend.
 * Success: { success: true, message?, data }
 * Error:   { success: false, message, errors? }
 */
export interface ApiSuccess<T> {
  success: true;
  message?: string;
  data: T;
}

export interface ApiFieldError {
  field: string;
  message: string;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: ApiFieldError[];
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

/** Cursor/offset pagination wrapper used by list endpoints. */
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
