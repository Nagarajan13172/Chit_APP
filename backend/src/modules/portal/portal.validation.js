import { z } from "zod";

export const loginSchema = z.object({
  phone: z.string().trim().regex(/^\d{10}$/, "Enter a valid 10-digit phone number"),
  password: z.string().min(1, "Password is required"),
});

export const paySchema = z.object({
  membershipId: z.coerce.number().int().positive("A valid membershipId is required"),
});

const optionalText = (max, label) =>
  z
    .string()
    .trim()
    .max(max, `${label} is too long`)
    .transform((v) => (v === "" ? null : v))
    .nullable()
    .optional();

// Members may edit their own name/email/address/area — but not their phone (login id).
export const updateProfileSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(120, "Name is too long").optional(),
    email: z
      .union([z.string().trim().max(254).email("Invalid email"), z.literal(""), z.null()])
      .transform((v) => (v ? v : null))
      .optional(),
    address: optionalText(500, "Address"),
    area: optionalText(120, "Area"),
  })
  .refine((obj) => Object.keys(obj).length > 0, { message: "At least one field must be provided" });
