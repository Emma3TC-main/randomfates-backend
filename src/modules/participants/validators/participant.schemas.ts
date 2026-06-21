import { z } from "zod";
import { ParticipantSource } from "../../../shared/enums/domain.enums";

export const createParticipantSchema = z.object({
  fullName: z.string().trim().min(2).max(150),
  identifier: z.string().trim().min(1).max(255),
  email: z.string().email().toLowerCase().optional(),
  source: z
    .enum([
      ParticipantSource.MANUAL,
      ParticipantSource.CSV,
      ParticipantSource.API,
    ])
    .default(ParticipantSource.MANUAL),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const bulkParticipantsSchema = z.object({
  filename: z.string().trim().default("manual-bulk.json"),
  participants: z.array(createParticipantSchema).min(1).max(1000),
});

export const listParticipantsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(50),
  search: z.string().trim().optional(),
});

export type CreateParticipantInput = z.infer<typeof createParticipantSchema>;
export type BulkParticipantsInput = z.infer<typeof bulkParticipantsSchema>;
