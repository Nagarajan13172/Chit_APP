import { format, isValid, parseISO } from "date-fns";

/** Format an ISO date string (or Date) for display; returns "—" when invalid. */
export function formatDate(value: string | Date | null | undefined, pattern = "dd MMM yyyy"): string {
  if (!value) return "—";
  const date = typeof value === "string" ? parseISO(value) : value;
  return isValid(date) ? format(date, pattern) : "—";
}

/** Format an amount as Indian Rupees (no decimals by default). */
export function formatCurrency(value: number | string, fractionDigits = 0): string {
  const amount = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(amount)) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(amount);
}
