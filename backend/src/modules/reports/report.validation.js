import { z } from "zod";
import { blankToUndefined } from "../../utils/zodHelpers.js";

// Validate as a real date, then emit YYYY-MM-DD so the SQL filter can compare against the
// business-tz calendar day (TZ-independent), consistent with the summary's month bucket.
const dateOnly = z.coerce.date().transform((d) => d.toISOString().slice(0, 10));

export const collectionsReportSchema = z.object({
  from: blankToUndefined(dateOnly.optional()),
  to: blankToUndefined(dateOnly.optional()),
  planId: blankToUndefined(z.coerce.number().int().positive().optional()),
  mode: blankToUndefined(z.enum(["CASH", "UPI", "CHEQUE"]).optional()),
  collectedBy: blankToUndefined(z.coerce.number().int().positive().optional()),
});

export const pendingReportSchema = z.object({
  page: blankToUndefined(z.coerce.number().int().min(1).default(1)),
  limit: blankToUndefined(z.coerce.number().int().min(1).max(100).default(20)),
  planId: blankToUndefined(z.coerce.number().int().positive().optional()),
});
