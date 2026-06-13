import { z } from "zod";
import { blankToUndefined } from "../../utils/zodHelpers.js";

const phoneRegex = /^\d{10}$/;

// Optional free-text field: trims, bounds length, and normalizes "" -> null so the
// field can be explicitly cleared on update (columns are nullable in the schema).
const optionalText = (max, label) =>
  z
    .string()
    .trim()
    .max(max, `${label} is too long`)
    .transform((v) => (v === "" ? null : v))
    .nullable()
    .optional();

// Optional email: accepts a valid email, "" or null; "" -> null so it can be cleared.
const optionalEmail = z
  .union([z.string().trim().max(254).email("Invalid email"), z.literal(""), z.null()])
  .transform((v) => (v ? v : null))
  .optional();

export const createCustomerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(120, "Name is too long"),
  phone: z.string().trim().regex(phoneRegex, "Phone must be a 10-digit number"),
  email: optionalEmail,
  address: optionalText(500, "Address"),
  area: optionalText(120, "Area"),
});

export const updateCustomerSchema = createCustomerSchema
  .partial()
  .refine((obj) => Object.keys(obj).length > 0, { message: "At least one field must be provided" });

export const listQuerySchema = z.object({
  page: blankToUndefined(z.coerce.number().int().min(1).default(1)),
  limit: blankToUndefined(z.coerce.number().int().min(1).max(1000).default(10)),
  search: blankToUndefined(z.string().trim().optional()),
  area: blankToUndefined(z.string().trim().optional()),
  // Filter by chit plan ("group") membership.
  planId: blankToUndefined(z.coerce.number().int().positive().optional()),
  // Filter by collection status: OVERDUE = has an overdue installment; UP_TO_DATE = none.
  status: blankToUndefined(z.enum(["UP_TO_DATE", "OVERDUE"]).optional()),
  // When "true", each row includes a financial summary (group, value, paid, progress, overdue).
  withSummary: blankToUndefined(z.enum(["true", "false"]).optional()),
  sortBy: blankToUndefined(z.enum(["name", "phone", "createdAt"]).default("createdAt")),
  sortOrder: blankToUndefined(z.enum(["asc", "desc"]).default("desc")),
});

export const searchQuerySchema = z.object({
  // Require at least 3 digits so a single character can't dump the table.
  phone: z.string().trim().regex(/^\d{3,10}$/, "Enter between 3 and 10 digits"),
});

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive("Invalid id"),
});

export const portalPasswordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters").max(72),
});
