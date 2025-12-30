import { z } from "zod";
import { commonRules } from "@/lib/schemas/common";

export const profileSchema = z.object({
  fullName: commonRules.fullName,
  phoneNumber: commonRules.phoneNumber,
  bio: commonRules.bio,
});

export type ProfileUpdateReqType = z.infer<typeof profileSchema>;
