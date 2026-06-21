import type { Request, Response } from "express";
import { successResponse } from "../../../shared/dto/api-response";
import { UnauthorizedException } from "../../../shared/exceptions/http.exception";
import { prizeService } from "../services/prize.service";
import {
  createPrizeSchema,
  listPrizesQuerySchema,
} from "../validators/prize.schemas";

const requireUser = (req: Request) => {
  if (!req.authUser) throw new UnauthorizedException();
  return req.authUser;
};

export const prizeController = {
  async create(req: Request, res: Response): Promise<void> {
    const user = requireUser(req);
    const input = createPrizeSchema.parse(req.body);
    const data = await prizeService.create(
      String(req.params.raffleId),
      user.id,
      user.role,
      input,
    );
    res.status(201).json(successResponse("Premio registrado", data));
  },

  async list(req: Request, res: Response): Promise<void> {
    const user = requireUser(req);
    const query = listPrizesQuerySchema.parse(req.query);
    const data = await prizeService.list(
      String(req.params.raffleId),
      user.id,
      user.role,
      query,
    );
    res.json(
      successResponse("Premios obtenidos", data.items, {
        pagination: data.pagination,
      }),
    );
  },

  async remove(req: Request, res: Response): Promise<void> {
    const user = requireUser(req);
    const data = await prizeService.remove(
      String(req.params.raffleId),
      String(req.params.prizeId),
      user.id,
      user.role,
    );
    res.json(successResponse("Premio eliminado", data));
  },
};
