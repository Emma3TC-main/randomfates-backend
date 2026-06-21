import { z } from "zod";

export const createPrizeSchema = z.object({
  name: z.string().trim().min(2).max(150),
  description: z.string().trim().max(1000).optional(),
  quantity: z.number().int().min(1).max(100).default(1),
});

export const listPrizesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export type CreatePrizeInput = z.infer<typeof createPrizeSchema>;
