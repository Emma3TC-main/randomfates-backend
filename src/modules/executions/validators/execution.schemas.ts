import { z } from "zod";

export const executeRaffleSchema = z.object({
  force: z.boolean().default(false).optional(),
});

export const listExecutionsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type ExecuteRaffleInput = z.infer<typeof executeRaffleSchema>;
