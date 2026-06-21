import type { Request, Response } from "express";
import { successResponse } from "../../../shared/dto/api-response";
import { UnauthorizedException } from "../../../shared/exceptions/http.exception";
import { participantService } from "../services/participant.service";
import {
  bulkParticipantsSchema,
  createParticipantSchema,
  listParticipantsQuerySchema,
} from "../validators/participant.schemas";

const requireUser = (req: Request) => {
  if (!req.authUser) throw new UnauthorizedException();
  return req.authUser;
};

export const participantController = {
  async create(req: Request, res: Response): Promise<void> {
    const user = requireUser(req);
    const input = createParticipantSchema.parse(req.body);
    const data = await participantService.create(
      String(req.params.raffleId),
      user.id,
      user.role,
      input,
    );
    res.status(201).json(successResponse("Participante registrado", data));
  },

  async list(req: Request, res: Response): Promise<void> {
    const user = requireUser(req);
    const query = listParticipantsQuerySchema.parse(req.query);
    const data = await participantService.list(
      String(req.params.raffleId),
      user.id,
      user.role,
      query,
    );
    res.json(
      successResponse("Participantes obtenidos", data.items, {
        pagination: data.pagination,
      }),
    );
  },

  async bulk(req: Request, res: Response): Promise<void> {
    const user = requireUser(req);
    const input = bulkParticipantsSchema.parse(req.body);
    const data = await participantService.bulkCreate(
      String(req.params.raffleId),
      user.id,
      user.role,
      input,
    );
    res
      .status(201)
      .json(successResponse("Importación de participantes completada", data));
  },

  async remove(req: Request, res: Response): Promise<void> {
    const user = requireUser(req);
    const data = await participantService.softDelete(
      String(req.params.raffleId),
      String(req.params.participantId),
      user.id,
      user.role,
    );
    res.json(successResponse("Participante eliminado lógicamente", data));
  },
};
