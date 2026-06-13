import { format } from "date-fns";
import { z } from "zod";
import type { PlanPayload } from "@/types/plan";

const isFinitePositive = (v: string) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0;
};

const requiredPositive = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .refine(isFinitePositive, `${label} must be greater than 0`);

const requiredInt = (label: string, min: number) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .refine((v) => Number.isInteger(Number(v)) && Number(v) >= min, {
      message: `${label} must be a whole number of at least ${min}`,
    });

/**
 * Plan-creation form schema. Numeric fields are kept as strings (text inputs)
 * and converted in {@link toPlanPayload}; the backend requires real numbers.
 */
export const planFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(120, "Name is too long"),
  chitValue: requiredPositive("Chit value"),
  // Optional — derived as chitValue / duration when left blank.
  installmentAmount: z
    .string()
    .trim()
    .refine((v) => v === "" || isFinitePositive(v), "Installment must be greater than 0"),
  durationMonths: requiredInt("Duration", 1),
  totalMembers: requiredInt("Total members", 1),
  startDate: z.date({ message: "Start date is required" }),
  status: z.enum(["ACTIVE", "CLOSED"]),
});

export type PlanFormValues = z.infer<typeof planFormSchema>;

/** Default values; startDate is intentionally omitted (picked by the user). */
export const planFormDefaults = {
  name: "",
  chitValue: "",
  installmentAmount: "",
  durationMonths: "",
  totalMembers: "",
  status: "ACTIVE",
} as const;

export function toPlanPayload(values: PlanFormValues): PlanPayload {
  return {
    name: values.name.trim(),
    chitValue: Number(values.chitValue),
    installmentAmount: values.installmentAmount.trim()
      ? Number(values.installmentAmount)
      : undefined,
    durationMonths: Number(values.durationMonths),
    totalMembers: Number(values.totalMembers),
    startDate: format(values.startDate, "yyyy-MM-dd"),
    status: values.status,
  };
}
