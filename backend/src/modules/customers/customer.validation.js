import { z } from "zod";

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
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().optional(),
  area: z.string().trim().optional(),
  sortBy: z.enum(["name", "phone", "createdAt"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const searchQuerySchema = z.object({
  // Require at least 3 digits so a single character can't dump the table.
  phone: z.string().trim().regex(/^\d{3,10}$/, "Enter between 3 and 10 digits"),
});

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive("Invalid id"),
});
