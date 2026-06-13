import { z } from "zod";

export const loginSchema = z.object({
  phone: z.string().trim().regex(/^\d{10}$/, "Enter a valid 10-digit phone number"),
  password: z.string().min(1, "Password is required"),
});

export const paySchema = z.object({
  membershipId: z.coerce.number().int().positive("A valid membershipId is required"),
});
