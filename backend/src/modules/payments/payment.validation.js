import { z } from "zod";

// True when n has at most 2 decimal places (a representable currency amount).
const isTwoDecimals = (n) => Math.abs(n * 100 - Math.round(n * 100)) < 1e-9;

export const createPaymentSchema = z
  .object({
    installmentId: z.coerce.number().int().positive("A valid installmentId is required"),
    amount: z
      .number({ invalid_type_error: "Amount must be a number" })
      .positive("Amount must be greater than 0")
      .max(99999999.99, "Amount is too large")
      .refine(isTwoDecimals, "Amount can have at most 2 decimal places"),
    lateFee: z
      .number({ invalid_type_error: "Late fee must be a number" })
      .min(0, "Late fee cannot be negative")
      .max(99999999.99, "Late fee is too large")
      .refine(isTwoDecimals, "Late fee can have at most 2 decimal places")
      .default(0),
    mode: z.enum(["CASH", "UPI", "CHEQUE"]),
    referenceNumber: z.string().trim().max(100).optional(),
    notes: z.string().trim().max(500).optional(),
  })
  .superRefine((data, ctx) => {
    if ((data.mode === "UPI" || data.mode === "CHEQUE") && !data.referenceNumber) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["referenceNumber"],
        message: "Reference number is required for UPI and Cheque payments",
      });
    }
  });

export const listPaymentsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  mode: z.enum(["CASH", "UPI", "CHEQUE"]).optional(),
  customerId: z.coerce.number().int().positive().optional(),
  membershipId: z.coerce.number().int().positive().optional(),
  from: z.coerce.date().optional(),
  // Make a date-only `to` inclusive of the whole day (paidAt is a timestamp, not a date).
  to: z
    .coerce.date()
    .optional()
    .transform((d) => {
      if (!d) return d;
      const end = new Date(d);
      end.setUTCHours(23, 59, 59, 999);
      return end;
    }),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive("Invalid id"),
});
