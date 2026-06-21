import type { Request, Response } from "express";
import { successResponse } from "../../../shared/dto/api-response";
import { UnauthorizedException } from "../../../shared/exceptions/http.exception";
import { executionService } from "../services/execution.service";
import {
  executeRaffleSchema,
  listExecutionsQuerySchema,
} from "../validators/execution.schemas";

const requireUser = (req: Request) => {
  if (!req.authUser) throw new UnauthorizedException();
  return req.authUser;
};

export const executionController = {
  async execute(req: Request, res: Response): Promise<void> {
    const user = requireUser(req);
    executeRaffleSchema.parse(req.body ?? {});
    const data = await executionService.execute(
      String(req.params.raffleId),
      user.id,
      user.role,
    );
    res
      .status(201)
      .json(successResponse("Sorteo ejecutado correctamente", data));
  },

  async listByRaffle(req: Request, res: Response): Promise<void> {
    const user = requireUser(req);
    const query = listExecutionsQuerySchema.parse(req.query);
    const data = await executionService.listByRaffle(
      String(req.params.raffleId),
      user.id,
      user.role,
      query,
    );
    res.json(
      successResponse("Ejecuciones obtenidas", data.items, {
        pagination: data.pagination,
      }),
    );
  },

  async getById(req: Request, res: Response): Promise<void> {
    const user = requireUser(req);
    const data = await executionService.getById(
      String(req.params.id),
      user.id,
      user.role,
    );
    res.json(successResponse("Ejecución obtenida", data));
  },
};
