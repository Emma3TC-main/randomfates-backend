import { z } from "zod";
import { RaffleState, RaffleType } from "../../../shared/enums/domain.enums";

export const raffleConfigurationSchema = z
  .object({
    winnersCount: z.number().int().min(1).max(100).optional(),
    allowDuplicates: z.boolean().default(false).optional(),
    animation: z.string().trim().optional(),
    rules: z.array(z.string().trim()).optional(),
  })
  .passthrough();

export const createRaffleSchema = z.object({
  title: z.string().trim().min(3).max(150),
  description: z.string().trim().max(1000).optional(),
  type: z
    .enum([RaffleType.ROULETTE, RaffleType.SLOT, RaffleType.RANDOM_PICKER])
    .default(RaffleType.ROULETTE),
  configuration: raffleConfigurationSchema.default({}),
  isPublic: z.boolean().default(false).optional(),
});

export const updateRaffleSchema = createRaffleSchema.partial();

export const listRafflesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  state: z
    .enum([
      RaffleState.DRAFT,
      RaffleState.ACTIVE,
      RaffleState.FINISHED,
      RaffleState.CANCELLED,
    ])
    .optional(),
});

export type CreateRaffleInput = z.infer<typeof createRaffleSchema>;
export type UpdateRaffleInput = z.infer<typeof updateRaffleSchema>;
