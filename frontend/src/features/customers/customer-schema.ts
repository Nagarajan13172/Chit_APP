import { z } from "zod";
import type { Customer, CustomerPayload } from "@/types/customer";

const phoneRegex = /^\d{10}$/;

/**
 * Form schema mirroring the backend's create/update validation. Optional fields
 * use empty-string-allowed strings here (form inputs never hold null); they're
 * converted to null in {@link toCustomerPayload} before sending.
 */
export const customerFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(120, "Name is too long"),
  phone: z.string().trim().regex(phoneRegex, "Phone must be a 10-digit number"),
  email: z.union([z.string().trim().max(254).email("Invalid email"), z.literal("")]),
  address: z.string().trim().max(500, "Address is too long"),
  area: z.string().trim().max(120, "Area is too long"),
});

export type CustomerFormValues = z.infer<typeof customerFormSchema>;

export const emptyCustomerForm: CustomerFormValues = {
  name: "",
  phone: "",
  email: "",
  address: "",
  area: "",
};

/** Prefill form values from an existing customer (null → ""). */
export function toFormValues(customer: Customer): CustomerFormValues {
  return {
    name: customer.name,
    phone: customer.phone,
    email: customer.email ?? "",
    address: customer.address ?? "",
    area: customer.area ?? "",
  };
}

/** Convert form values to an API payload (blank optionals → null). */
export function toCustomerPayload(values: CustomerFormValues): CustomerPayload {
  return {
    name: values.name.trim(),
    phone: values.phone.trim(),
    email: values.email.trim() || null,
    address: values.address.trim() || null,
    area: values.area.trim() || null,
  };
}
