import type { Request, Response } from "express";
import { z } from "zod";
import { successResponse } from "../../../shared/dto/api-response";
import { auditService } from "../services/audit.service";

const auditQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  entityType: z.string().trim().optional(),
});

export const auditController = {
  async list(req: Request, res: Response): Promise<void> {
    const query = auditQuerySchema.parse(req.query);
    const data = await auditService.list(query);
    res.json(
      successResponse("Auditoría obtenida", data.items, {
        pagination: data.pagination,
      }),
    );
  },

  async kpis(_req: Request, res: Response): Promise<void> {
    const data = await auditService.kpis();
    res.json(successResponse("KPIs obtenidos", data));
  },
};
