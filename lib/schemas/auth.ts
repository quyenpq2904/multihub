import { z } from "zod";
import { commonRules } from "./common";

export const loginSchema = z.object({
  email: commonRules.email,
  password: commonRules.password,
  remember: z.boolean().optional(),
});

export const signUpSchema = z
  .object({
    fullName: commonRules.fullName,
    email: commonRules.email,
    password: commonRules.password,
    confirmPassword: commonRules.confirmPassword,
    terms: z.literal(true, {
      message: "You must accept the terms and conditions",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type LoginSchema = z.infer<typeof loginSchema>;
export type SignUpSchema = z.infer<typeof signUpSchema>;
