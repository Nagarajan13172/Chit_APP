import axios from "axios";
import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import type { ApiFieldError } from "@/api/types";

/**
 * Map a backend error response onto react-hook-form fields:
 * - 400 validation → each `errors[]` entry whose field is allowed
 * - 409 conflict   → pinned to `conflictField` (e.g. a unique column)
 */
export function applyServerFieldErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  allowedFields: readonly string[],
  conflictField?: Path<T>,
): void {
  if (!axios.isAxiosError(error)) return;
  const data = error.response?.data as { message?: string; errors?: ApiFieldError[] } | undefined;

  if (Array.isArray(data?.errors)) {
    for (const fieldError of data.errors) {
      if (allowedFields.includes(fieldError.field)) {
        setError(fieldError.field as Path<T>, { message: fieldError.message });
      }
    }
    return;
  }

  if (error.response?.status === 409 && conflictField) {
    setError(conflictField, { message: data?.message ?? "This value conflicts with an existing record" });
  }
}
