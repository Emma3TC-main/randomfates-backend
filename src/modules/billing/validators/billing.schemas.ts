import { z } from "zod";

export const createPlanSchema = z.object({
  name: z.string().trim().min(2).max(100),
  price: z.number().min(0),
  features: z.record(z.string(), z.unknown()).default({}),
});

export const subscribeSchema = z.object({
  planId: z.string().uuid(),
  months: z.number().int().min(1).max(24).default(1),
});

export const approvePaymentSchema = z.object({
  subscriptionId: z.string().uuid(),
  transactionReference: z.string().trim().min(3).max(255),
  gatewayResponse: z.record(z.string(), z.unknown()).default({}),
});

export type CreatePlanInput = z.infer<typeof createPlanSchema>;
export type SubscribeInput = z.infer<typeof subscribeSchema>;
export type ApprovePaymentInput = z.infer<typeof approvePaymentSchema>;
