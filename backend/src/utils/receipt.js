import { randomUUID } from "node:crypto";
import { businessDateParts } from "./businessTime.js";

/** Collision-free placeholder used at insert time before the final receipt number is known. */
export function tempReceiptNumber() {
  return `TMP-${randomUUID()}`;
}

/**
 * Human-friendly, globally-unique receipt number: RCPT-YYYYMM-000123.
 * The YYYYMM segment uses the business timezone (consistent with overdue logic);
 * the padded id (PK) guarantees uniqueness.
 */
export function formatReceiptNumber(date, id) {
  const { year, month } = businessDateParts(date);
  return `RCPT-${year}${month}-${String(id).padStart(6, "0")}`;
}
