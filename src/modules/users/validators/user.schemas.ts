import { z } from "zod";
import {
  UserRole,
  SubscriptionStatus,
} from "../../../shared/enums/domain.enums";

export const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().optional(),
});

export const updateUserStatusSchema = z.object({
  isActive: z.boolean().optional(),
  role: z.enum([UserRole.ADMIN, UserRole.USER, UserRole.PREMIUM]).optional(),
  subscriptionStatus: z
    .enum([
      SubscriptionStatus.ACTIVE,
      SubscriptionStatus.EXPIRED,
      SubscriptionStatus.CANCELLED,
    ])
    .optional(),
});
