import { z } from "zod";
import { blankToUndefined } from "../../utils/zodHelpers.js";

const money = (label) =>
  z
    .number({ invalid_type_error: `${label} must be a number` })
    .positive(`${label} must be greater than 0`)
    .max(99999999.99, `${label} is too large`);

export const createPlanSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(120, "Name is too long"),
  chitValue: money("Chit value"),
  // Optional — derived as chitValue / durationMonths (rounded to 2dp) when omitted.
  installmentAmount: money("Installment amount").optional(),
  durationMonths: z.number().int().min(1, "Duration must be at least 1 month").max(600),
  totalMembers: z.number().int().min(1, "Total members must be at least 1").max(10000),
  startDate: z.coerce.date({ invalid_type_error: "startDate must be a valid date" }),
  status: z.enum(["ACTIVE", "CLOSED"]).default("ACTIVE"),
});

export const listPlansQuerySchema = z.object({
  page: blankToUndefined(z.coerce.number().int().min(1).default(1)),
  limit: blankToUndefined(z.coerce.number().int().min(1).max(100).default(10)),
  search: blankToUndefined(z.string().trim().optional()),
  status: blankToUndefined(z.enum(["ACTIVE", "CLOSED"]).optional()),
  sortBy: blankToUndefined(z.enum(["name", "startDate", "createdAt"]).default("createdAt")),
  sortOrder: blankToUndefined(z.enum(["asc", "desc"]).default("desc")),
});

export const assignMemberSchema = z.object({
  customerId: z.coerce.number().int().positive("A valid customerId is required"),
  ticketNumber: z.coerce.number().int().positive().optional(),
});

export const updatePlanStatusSchema = z.object({
  status: z.enum(["ACTIVE", "CLOSED"]),
});

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive("Invalid id"),
});
