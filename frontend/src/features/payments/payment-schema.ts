import { z } from "zod";
import type { CreatePaymentPayload, PaymentMode } from "@/types/payment";

/** True when v is a number with at most 2 decimal places. */
const twoDecimals = (v: string) => {
  const n = Number(v);
  return Number.isFinite(n) && Math.abs(n * 100 - Math.round(n * 100)) < 1e-9;
};

/**
 * Collect-payment form schema. `pending` bounds the amount (matching the
 * backend's "amount can't exceed pending" rule). Numeric inputs are strings.
 */
export function createPaymentFormSchema(pending: number) {
  return z
    .object({
      amount: z
        .string()
        .trim()
        .min(1, "Amount is required")
        .refine((v) => Number(v) > 0, "Amount must be greater than 0")
        .refine(twoDecimals, "At most 2 decimal places")
        .refine((v) => Number(v) <= pending + 1e-9, `Amount can't exceed the pending ₹${pending}`),
      mode: z.enum(["CASH", "UPI", "CHEQUE"]),
      referenceNumber: z.string().trim().max(100, "Reference is too long"),
      notes: z.string().trim().max(500, "Notes are too long"),
    })
    .superRefine((data, ctx) => {
      if ((data.mode === "UPI" || data.mode === "CHEQUE") && !data.referenceNumber) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["referenceNumber"],
          message: "Reference number is required for UPI and Cheque",
        });
      }
    });
}

export type PaymentFormValues = z.infer<ReturnType<typeof createPaymentFormSchema>>;

export function paymentFormDefaults(pending: number): PaymentFormValues {
  return {
    amount: pending > 0 ? String(pending) : "",
    mode: "CASH" as PaymentMode,
    referenceNumber: "",
    notes: "",
  };
}

export function toPaymentPayload(
  values: PaymentFormValues,
  installmentId: number,
): CreatePaymentPayload {
  return {
    installmentId,
    amount: Number(values.amount),
    mode: values.mode,
    referenceNumber: values.referenceNumber.trim() || undefined,
    notes: values.notes.trim() || undefined,
  };
}
