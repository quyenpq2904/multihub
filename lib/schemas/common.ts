import { z } from "zod";

export const commonRules = {
  email: z.email("Invalid email address"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(32, "Password must be less than 32 characters"),

  confirmPassword: z
    .string()
    .min(6, "Confirm Password must be at least 6 characters")
    .max(32, "Confirm Password must be less than 32 characters"),

  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(50, "Full name must be less than 50 characters"),

  phoneNumber: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^[0-9]+$/, "Phone number must contain only digits")
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number is too long"),

  bio: z
    .string()
    .max(500, "Bio must be less than 500 characters")
    .optional()
    .or(z.literal("")),

  id: z.uuid(),
};
