import type { Request, Response } from "express";
import { successResponse } from "../../../shared/dto/api-response";
import { UnauthorizedException } from "../../../shared/exceptions/http.exception";
import { raffleService } from "../services/raffle.service";
import {
  createRaffleSchema,
  listRafflesQuerySchema,
  updateRaffleSchema,
} from "../validators/raffle.schemas";

const requireUser = (req: Request) => {
  if (!req.authUser) throw new UnauthorizedException();
  return req.authUser;
};

export const raffleController = {
  async create(req: Request, res: Response): Promise<void> {
    const user = requireUser(req);
    const input = createRaffleSchema.parse(req.body);
    const data = await raffleService.create(user.id, input);
    res.status(201).json(successResponse("Sorteo creado", data));
  },

  async list(req: Request, res: Response): Promise<void> {
    const user = requireUser(req);
    const query = listRafflesQuerySchema.parse(req.query);
    const data = await raffleService.list(user.id, user.role, query);
    res.json(
      successResponse("Sorteos obtenidos", data.items, {
        pagination: data.pagination,
      }),
    );
  },

  async getById(req: Request, res: Response): Promise<void> {
    const user = requireUser(req);
    const data = await raffleService.getById(
      String(req.params.id),
      user.id,
      user.role,
    );
    res.json(successResponse("Sorteo obtenido", data));
  },

  async getPublic(req: Request, res: Response): Promise<void> {
    const data = await raffleService.getPublic(String(req.params.publicToken));
    res.json(successResponse("Sorteo público obtenido", data));
  },

  async update(req: Request, res: Response): Promise<void> {
    const user = requireUser(req);
    const input = updateRaffleSchema.parse(req.body);
    const data = await raffleService.update(
      String(req.params.id),
      user.id,
      user.role,
      input,
    );
    res.json(successResponse("Sorteo actualizado", data));
  },

  async publish(req: Request, res: Response): Promise<void> {
    const user = requireUser(req);
    const data = await raffleService.publish(
      String(req.params.id),
      user.id,
      user.role,
    );
    res.json(successResponse("Sorteo publicado y listo para ejecución", data));
  },

  async cancel(req: Request, res: Response): Promise<void> {
    const user = requireUser(req);
    const data = await raffleService.cancel(
      String(req.params.id),
      user.id,
      user.role,
    );
    res.json(successResponse("Sorteo cancelado", data));
  },

  async remove(req: Request, res: Response): Promise<void> {
    const user = requireUser(req);
    const data = await raffleService.softDelete(
      String(req.params.id),
      user.id,
      user.role,
    );
    res.json(successResponse("Sorteo eliminado lógicamente", data));
  },
};
